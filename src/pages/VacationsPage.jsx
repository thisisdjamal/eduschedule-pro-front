import DashboardLayout from '../components/DashboardLayout'
import './VacationsPage.css'
import { useState, useEffect } from 'react' // useEffect ajouté pour le chargement initial
import { useAuth } from '../context/AuthContext' // import du contexte pour récupérer le token JWT

// Endpoint vacations — utilisé pour GET (liste + détail), POST (signer/valider/approuver), GET PDF
const API_VACATIONS = `${import.meta.env.VITE_API_URL}/Vacations.php`

function VacationsPage() {
  const { user, token } = useAuth()

  // Headers communs à tous les appels API
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // États pour les données et l'interface
  const [vacations, setVacations] = useState([])    // liste chargée depuis l'API
  const [selectedVacation, setSelectedVacation] = useState(null)  // vacation affichée en détail
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Etats pour le fourmulaire de genération des fiches
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [enseignants, setEnseignants] = useState([])
  const [generateData, setGenerateData] = useState({
    id_enseignant: '',
    mois:  new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  })
  const [generating, setGenerating] = useState(false)

  // ── Chargement initial de la liste ───────────────────────
  // GET /api/vacations.php — si rôle enseignant, le PHP filtre automatiquement
  // sur id_lien pour ne retourner que ses propres vacations
  useEffect(() => {
    fetchVacations()
  }, [token])

  // Charge la liste des enseignants vacataires pour le formulaire de génération
  // GET /api/Enseignants.php filtré sur statut vacataire, les enseignants permanents sont payés au mois et n'ont pas de fiches de vacation
  const fetchEnseignants = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/Enseignants.php?statut=vacataire`, { headers })
      const json = await res.json()
      if (json.success) setEnseignants(json.data || [])
    } catch (err) {
      console.error('Erreur chargement enseignants :', err.message)
    }
  }
  const fetchVacations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(API_VACATIONS, { headers })
      const json = await res.json()

      if (json.success) {
        // Transforme les données API pour correspondre aux champs de l'original
        setVacations(
          (json.data || []).map(v => ({
            id: v.id,
            // Nom complet de l'enseignant, retourné par le JOIN enseignants dans le PHP
            enseignant:  `${v.enseignant_prenom || ''} ${v.enseignant_nom || ''}`.trim(),
            // Formate "4/2026" en "Avril 2026"
            mois: `${nomMois(v.mois)} ${v.annee}`,
            montant_brut: Number(v.montant_brut),
            montant_net: Number(v.montant_net),
            retenues: Number(v.retenues),
            statut: traduireStatut(v.statut),
            statut_api: v.statut, // conservé pour les conditions d'action (signer/valider/approuver)
            // Ces flags dérivent du statut API, utilisés pour les boutons de validation
            signature_enseignant: v.statut !== 'generee',
            visa_surveillant: ['validee_surveillant','approuvee_comptable'].includes(v.statut),
            validation_comptable: v.statut === 'approuvee_comptable',
            // seances est null en liste, chargé au clic sur "Voir Détails" via GET ?id=X
            seances: [],
          }))
        )
      } else {
        setError(json.message || 'Erreur chargement vacations')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }


  // Convertit le numéro de mois (1–12) en nom français
  const nomMois = (num) => {
    const noms = ['','Janvier','Février','Mars','Avril','Mai','Juin',
                  'Juillet','Août','Septembre','Octobre','Novembre','Décembre']
    return noms[Number(num)] || num
  }

  // Traduit le statut API en libellé lisible correspondant à l'original
  const traduireStatut = (statut) => {
    if (statut === 'generee') return 'En attente'
    if (statut === 'signee_enseignant') return 'En attente'
    if (statut === 'validee_surveillant') return 'Validée'
    if (statut === 'approuvee_comptable') return 'Payée'
    return 'En attente'
  }

  // ── Générer les fiches du mois ────────────────────────────
  // POST /api/vacations.php?action=generer (admin/comptable uniquement)
  // Ouvre le formulaire de génération et charge la liste des enseignants
  const handleGenerateFiches = () => {
    fetchEnseignants()
    setShowGenerateForm(true)
  }

  // Soumet le formulaire de génération
  // POST /api/Vacations.php?action=generer avec id_enseignant, mois, annee
  const handleSubmitGenerate = async () => {
    if (!generateData.id_enseignant) {
      alert('Veuillez sélectionner un enseignant')
      return
    }

    setGenerating(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?action=generer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id_enseignant: Number(generateData.id_enseignant),
          mois: Number(generateData.mois),
          annee: Number(generateData.annee),
        })
      })
      const json = await res.json()

      if (json.success) {
        alert(`✅ Fiche générée — ${json.nb_seances} séance(s) — Montant net : ${Number(json.montant_net).toLocaleString('fr-FR')} FCFA`)
        setShowGenerateForm(false)
        await fetchVacations() // rafraîchit la liste
      } else {
        // 409 = fiche déjà existante pour ce mois
        // 404 = aucune séance clôturée trouvée
        alert('Erreur : ' + json.message)
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  // ── Voir le détail d'une vacation ─────────────────────────
  // GET /api/vacations.php?id=X — retourne lignes[] et validations[] inclus
  // On charge le détail complet avant d'afficher la vue détail
  const handleViewDetails = async (vacation) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?id=${vacation.id}`, { headers })
      const json = await res.json()

      if (json.success) {
        const v = json.data
        // Reconstruit l'objet vacation avec les données complètes (lignes + validations)
        setSelectedVacation({
          ...vacation, // conserve id, enseignant, mois, statut, flags déjà calculés
          // lignes[] = détail des séances retourné par getVacationComplete() en PHP
          seances: (v.lignes || []).map(l => ({
            date: l.jour,
            matiere: l.matiere,
            classe: l.classe,
            heure_debut: l.heure_debut?.slice(0, 5) || '',
            heure_fin: l.heure_fin?.slice(0, 5)   || '',
            duree: Number(l.duree_heures),
            taux: Number(l.taux),
          })),
        })
      } else {
        alert('Erreur chargement détail : ' + json.message)
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    }
    setShowPDFPreview(false)
  }

  // ── Signer (enseignant) ───────────────────────────────────
  // POST /api/Vacations.php?id=X&action=signer
  // Passe le statut de 'generee' → 'signee_enseignant'
  const handleSignEnseignant = async (vacationId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?id=${vacationId}&action=signer`, {
        method: 'POST',
        headers,
        // signature_base64 : placeholder, pour le moment mais on remplacera par un vrai SignaturePad
        body: JSON.stringify({ signature_base64: 'signature_enseignant' })
      })
      const json = await res.json()
      if (json.success) {
        alert('✅ Signature enseignant enregistrée')
        // Met à jour localement le flag sans recharger toute la liste
        setVacations(prev => prev.map(v =>
          v.id === vacationId ? { ...v, signature_enseignant: true, statut: 'En attente' } : v
        ))
        // Met aussi à jour la vue détail si ouverte
        if (selectedVacation?.id === vacationId) {
          setSelectedVacation(prev => ({ ...prev, signature_enseignant: true }))
        }
      } else {
        alert('Erreur : ' + json.message)
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    }
  }

  // ── Visa surveillant ──────────────────────────────────────
  // POST /api/Vacations.php?id=X&action=valider
  // Passe le statut de 'signee_enseignant' → 'validee_surveillant'
  // L'API vérifie que statut === 'signee_enseignant' avant d'accepter
  const handleVisaSurveillant = async (vacationId) => {
    if (!window.confirm("Valider cette fiche de vacation ?")) return;

    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?id=${vacationId}&action=valider`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ visa_base64: null, commentaire: null })
      })
      const json = await res.json()
      if (json.success) {
        alert('Visa surveillant enregistré')
        await fetchVacations()   // Rafraîchit la liste complète
        // Met à jour la vue détail si elle est ouverte
        if (selectedVacation?.id === vacationId) {
          setSelectedVacation(prev => ({ ...prev, visa_surveillant: true, statut: 'Validée' }))
        }
      } else {
        alert('Erreur : ' + json.message)
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    }
  }

  // ── Validation comptable ──────────────────────────────────
  // POST /api/Vacations.php?id=X&action=approuver
  // Passe le statut de 'validee_surveillant' → 'approuvee_comptable'
  // L'API vérifie que statut === 'validee_surveillant' avant d'accepter
  const handleApprobationComptable = async (vacationId) => {
    if (!window.confirm("Approuver cette fiche et autoriser le paiement ?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?id=${vacationId}&action=approuver`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ commentaire: null })
      })
      const json = await res.json()
      if (json.success) {
        alert('✅ Validation comptable effectuée — Bon de paiement généré')
        await fetchVacations()
        if (selectedVacation?.id === vacationId) {
          setSelectedVacation(prev => ({ ...prev, validation_comptable: true, statut: 'Payée' }))
        }
      } else {
        alert('Erreur : ' + json.message)
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message)
    }
  }

  // ── Télécharger PDF ───────────────────────────────────────
  // GET /api/Vacations.php?id=X&action=pdf retourne directement le fichier PDF
  // On ouvre dans un nouvel onglet pour déclencher le téléchargement natif
  const generatePDF = async (vacation) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Vacations.php?id=${vacation.id}&action=pdf`, {
        method: 'GET',
        headers: {
          // Remplacez 'votre_token' par la variable qui contient votre token (ex: localStorage.getItem('token'))
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      // Conversion de la réponse en Blob (Binary Large Object)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Création d'un lien invisible pour forcer le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vacation_${vacation.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // Vue détail
  if (selectedVacation) {
    return (
      <DashboardLayout>
        <button className="btn-back" onClick={() => setSelectedVacation(null)}>← Retour</button>

        <div className="vacation-detail-card">
          <div className="detail-header">
            <div>
              <h3>{selectedVacation.enseignant}</h3>
              <p>Période: {selectedVacation.mois}</p>
            </div>
            <span className={`badge badge-${selectedVacation.statut.toLowerCase().replace(' ', '-')}`}>
              {selectedVacation.statut}
            </span>
          </div>

          {/* TABLEAU DES SÉANCES, alimenté par lignes[] retourné par GET ?id=X */}
          <div className="seances-section">
            <h4> Détail des Séances</h4>
            <div className="seances-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Matière</th>
                    <th>Classe</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Durée (h)</th>
                    <th>Taux Horaire</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVacation.seances.map((seance, idx) => (
                    <tr key={idx}>
                      <td>{seance.date}</td>
                      <td>{seance.matiere}</td>
                      <td>{seance.classe}</td>
                      <td>{seance.heure_debut}</td>
                      <td>{seance.heure_fin}</td>
                      <td>{seance.duree}</td>
                      <td>{seance.taux.toLocaleString('fr-FR')} FCFA</td>
                      {/* Montant = duree × taux, calculé localement pour l'affichage */}
                      <td>{(seance.duree * seance.taux).toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RÉSUMÉ FINANCIER, données issues de l'objet vacation */}
          <div className="resume-section">
            <div className="resume-grid">
              <div className="resume-item">
                <label>Total Heures</label>
                <p className="big">
                  {selectedVacation.seances.reduce((sum, s) => sum + s.duree, 0)}h
                </p>
              </div>
              <div className="resume-item">
                <label>Montant Brut</label>
                <p className="big">{selectedVacation.montant_brut.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="resume-item">
                <label>Retenues</label>
                <p className="big text-danger">{selectedVacation.retenues.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="resume-item">
                <label>Montant Net à Payer</label>
                <p className="big text-success">{selectedVacation.montant_net.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          {/* CHAÎNE DE VALIDATION, boutons actifs selon le rôle et le statut courant */}
          <div className="validations-section">
            <h4> Chaîne de Validation</h4>
            <div className="validation-steps">

              {/* Étape 1 : signature enseignant
                  Visible seulement si l'utilisateur est enseignant et n'a pas encore signé */}
              <div className={`step ${selectedVacation.signature_enseignant ? 'completed' : ''}`}>
                <div className="step-icon">1</div>
                <div className="step-content">
                  <h5>Signature Enseignant</h5>
                  {!selectedVacation.signature_enseignant && user?.role === 'enseignant' ? (
                    <button className="btn-validate"
                      onClick={() => handleSignEnseignant(selectedVacation.id)}>
                      Signer
                    </button>
                  ) : (
                    <p className="text-success">✅ Signé</p>
                  )}
                </div>
              </div>

              {/* Étape 2 : visa surveillant
                  Visible si l'utilisateur est surveillant et que l'enseignant a signé */}
              <div className={`step ${selectedVacation.visa_surveillant ? 'completed' : ''}`}>
                <div className="step-icon">2</div>
                <div className="step-content">
                  <h5>Visa Surveillant</h5>
                  {!selectedVacation.visa_surveillant && user?.role === 'surveillant' ? (
                    <button className="btn-validate"
                      onClick={() => handleVisaSurveillant(selectedVacation.id)}>
                      ✅ Valider
                    </button>
                  ) : selectedVacation.visa_surveillant ? (
                    <p className="text-success">✅ Validé</p>
                  ) : (
                    <p style={{ color: '#888', fontSize: '12px' }}>En attente signature enseignant</p>
                  )}
                </div>
              </div>

              {/* Étape 3 : validation comptable
                  Visible si l'utilisateur est comptable et que le surveillant a validé */}
              <div className={`step ${selectedVacation.validation_comptable ? 'completed' : ''}`}>
                <div className="step-icon">3</div>
                <div className="step-content">
                  <h5>Validation Comptable</h5>
                  {!selectedVacation.validation_comptable && user?.role === 'comptable' ? (
                    <button className="btn-validate"
                      onClick={() => handleApprobationComptable(selectedVacation.id)}>
                      ✅ Approuver
                    </button>
                  ) : selectedVacation.validation_comptable ? (
                    <p className="text-success">✅ Approuvé</p>
                  ) : (
                    <p style={{ color: '#888', fontSize: '12px' }}>En attente visa surveillant</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="detail-actions">
            <button className="btn-primary"
              onClick={() => setShowPDFPreview(!showPDFPreview)}>
               {showPDFPreview ? 'Masquer' : 'Aperçu'} PDF
            </button>
            {/* generatePDF ouvre GET ?id=X&action=pdf dans un nouvel onglet */}
            <button className="btn-download" onClick={() => generatePDF(selectedVacation)}>
              ⬇️ Télécharger PDF
            </button>
          </div>

          {/* APERÇU PDF */}
          {showPDFPreview && (
            <div className="pdf-preview">
              <h5>Aperçu PDF</h5>
              <div className="pdf-content">
                <p>Fiche de Vacation - {selectedVacation.enseignant}</p>
                <p>Période: {selectedVacation.mois}</p>
                <p>Montant Net: <strong>{selectedVacation.montant_net.toLocaleString('fr-FR')} FCFA</strong></p>
                <p style={{ marginTop: '20px', fontSize: '12px', color: 'gray' }}>
                  [Ceci est un aperçu. Le PDF complet inclura tous les détails, les signatures et les validations]
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    )
  }

  // ── Vue liste des vacations ───────────────────────────────────────
  return (
    <DashboardLayout>
      <h2>Fiches de Vacation</h2>

      {/* Indicateurs de chargement et d'erreur — ajoutés sans modifier la structure */}
      {loading && <p style={{ color: '#888', marginBottom: '12px' }}>Chargement des fiches...</p>}
      {error   && <p style={{ color: 'red',  marginBottom: '12px' }}>{error}</p>}

      {/* Génération visible uniquement pour admin et comptable */}
      {['admin', 'comptable'].includes(user?.role) && (
        <button className="btn-generate" onClick={handleGenerateFiches}>
          Générer fiches du mois
        </button>
      )}

      {/* Modal de génération, visible uniquement quand showGenerateForm est true */}
      {showGenerateForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '8px',
            padding: '24px', width: '400px', maxWidth: '90vw'
          }}>
            <h4 style={{ marginBottom: '16px' }}>Générer une fiche de vacation</h4>

            {/* Sélection de l'enseignant */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Enseignant *</label>
              <select
                value={generateData.id_enseignant}
                onChange={(e) => setGenerateData({ ...generateData, id_enseignant: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom} — {e.specialite}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection du mois */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Mois *</label>
              <select
                value={generateData.mois}
                onChange={(e) => setGenerateData({ ...generateData, mois: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                {['Janvier','Février','Mars','Avril','Mai','Juin',
                  'Juillet','Août','Septembre','Octobre','Novembre','Décembre']
                  .map((m, i) => (
                    <option key={i+1} value={i+1}>{m}</option>
                  ))
                }
              </select>
            </div>

            {/* Sélection de l'année */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Année *</label>
              <select
                value={generateData.annee}
                onChange={(e) => setGenerateData({ ...generateData, annee: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                {/* Propose les 3 dernières années + l'année courante */}
                {[0,1,2,3].map(i => {
                  const annee = new Date().getFullYear() - i
                  return <option key={annee} value={annee}>{annee}</option>
                })}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-save"
                onClick={handleSubmitGenerate}
                disabled={generating}
                style={{ flex: 2 }}
              >
                {generating ? '⏳ Génération...' : '✅ Générer'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowGenerateForm(false)}
                disabled={generating}
                style={{ flex: 1 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="vacation-table-container">
        <table className="vacation-table">
          <thead>
            <tr>
              <th>Enseignant</th>
              <th>Période</th>
              <th>Heures</th>
              <th>Montant Brut</th>
              <th>Montant Net</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacations.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#888' }}>
                  Aucune fiche de vacation disponible.
                </td>
              </tr>
            )}
            {vacations.map(vacation => (
              <tr key={vacation.id}>
                <td><strong>{vacation.enseignant}</strong></td>
                <td>{vacation.mois}</td>
                {/* Heures calculées depuis les seances[], vide en liste, rempli au clic "Voir Détails" */}
                <td>{vacation.seances.reduce((sum, s) => sum + s.duree, 0) || '—'}h</td>
                <td>{vacation.montant_brut.toLocaleString('fr-FR')} FCFA</td>
                <td className="montant-net">{vacation.montant_net.toLocaleString('fr-FR')} FCFA</td>
                <td>
                  <span className={`status-badge status-${vacation.statut.toLowerCase().replace(' ', '-')}`}>
                    {vacation.statut}
                  </span>
                </td>
                <td>
                  {/* handleViewDetails charge le détail complet via GET ?id=X avant d'afficher */}
                  <button className="btn-view" onClick={() => handleViewDetails(vacation)}>
                    Voir Détails
                  </button>
                  {/* generatePDF ouvre GET ?id=X&action=pdf dans un nouvel onglet */}
                  <button className="btn-pdf" onClick={() => generatePDF(vacation)}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

export default VacationsPage