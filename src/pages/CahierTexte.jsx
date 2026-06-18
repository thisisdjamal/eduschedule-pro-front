import DashboardLayout from '../components/DashboardLayout'
import './CahierTexte.css'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import SignaturePad from 'signature_pad'

function CahierTexte() {
  const { user, token } = useAuth()

  // En-têtes avec token pour les requêtes API
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // États principaux
  const [cahiers, setCahiers] = useState([])
  const [creneauxDispo, setCreneauxDispo] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [currentCahier, setCurrentCahier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formMsg, setFormMsg] = useState('')

  // États pour la clôture par l'enseignant
  const [heureFin, setHeureFin] = useState('')
  const [clotureMsg, setClotureMsg] = useState('')
  const [clotureSaving, setClotureSaving] = useState(false)

  // Formulaire de création
  const [formData, setFormData] = useState({
    id_creneau: '',
    titre_cours: '',
    contenu: '',
    points_vus: '',
    niveau_avancement: '',
    travaux_demandes: '',
    observations: ''
  })

  // Refs signatures
  const canvasDelegueRef = useRef(null)
  const canvasEnseignantRef = useRef(null)
  const canvasClotureRef = useRef(null)
  const signaturePadDelegue = useRef(null)
  const signaturePadEnseignant = useRef(null) 
  const signaturePadCloture = useRef(null)

  // Chargement des cahiers à l'initialisation et à chaque changement de token
  useEffect(() => {
    fetchCahiers()
  }, [token])

  // Initialisation des Signature Pads
  useEffect(() => {
    // Pour le délégué (formulaire de création)
    if (showForm && canvasDelegueRef.current) {
      if (!signaturePadDelegue.current) {
        signaturePadDelegue.current = new SignaturePad(canvasDelegueRef.current, {
          backgroundColor: 'rgba(255,255,255,1)',
          penColor: '#000000'
        })
      }
    }

    // Pour l'enseignant (clôture)
    if (currentCahier && user?.role === 'enseignant' && currentCahier.statut === 'signe_delegue' && canvasClotureRef.current) {
      if (!signaturePadCloture.current) {
        signaturePadCloture.current = new SignaturePad(canvasClotureRef.current, {
          backgroundColor: 'rgba(255,255,255,1)',
          penColor: '#000000'
        })
      }
    }

    // Nettoyage des Signature Pads lors de la fermeture du formulaire ou du retour à la liste
    return () => {
      // Nettoyage
      if (signaturePadDelegue.current) signaturePadDelegue.current.off()
      if (signaturePadCloture.current) signaturePadCloture.current.off()
    }
  }, [showForm, currentCahier, user?.role])

  // Fonction pour charger les cahiers depuis l'API
  const fetchCahiers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Cahiers.php`, { headers })
      const json = await res.json()
      //verification de la reponse de l'api, si success est true, on met a jour les cahiers, sinon on affiche le message d'erreur
      if (json.success) {
        setCahiers(json.data || [])
      } else {
        setError(json.message || 'Erreur chargement cahiers')
      }
    } catch (err) {
      setError('Erreur de connexion : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Création d'un nouveau cahier (délégué) : affichage du formulaire + chargement des créneaux disponibles
  const handleCreateCahier = async () => {
    setFormMsg('')
    setFormData({
      id_creneau: '', titre_cours: '', contenu: '',
      points_vus: '', niveau_avancement: '', travaux_demandes: '', observations: ''
    })

    // Charge les créneaux disponibles pour la semaine en cours
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Dashboard.php`, { headers })
      const json = await res.json()

      if (json.success && json.data?.cahiers_a_remplir) {
        setCreneauxDispo(json.data.cahiers_a_remplir)
      } else {
        setCreneauxDispo([])
      }
    } catch {
      setCreneauxDispo([])
    }

    setShowForm(true)
    setTimeout(initSignaturePads, 100)
  }

  // Initialisation des Signature Pads pour les formulaires de création et de clôture
  const initSignaturePads = () => {
    if (canvasDelegueRef.current && !signaturePadDelegue.current) {
      signaturePadDelegue.current = new SignaturePad(canvasDelegueRef.current, {
        backgroundColor: 'rgba(255,255,255,1)',
        penColor: '#000000'
      })
    }
    if (canvasEnseignantRef.current && !signaturePadEnseignant.current) {
      signaturePadEnseignant.current = new SignaturePad(canvasEnseignantRef.current, {
        backgroundColor: 'rgba(255,255,255,1)',
        penColor: '#000000'
      })
    }
  }

  // Efface une signature
  const handleClearSignature = (pad) => {
    if (pad === 'delegue' && signaturePadDelegue.current) {
      signaturePadDelegue.current.clear()
    }
    if (pad === 'cloture' && signaturePadCloture.current) {
      signaturePadCloture.current.clear()
    }
  }

  // Enregistrement du cahier avec signature du délégué
  const handleSaveCahier = async () => {
    setFormMsg('')

    if (!formData.id_creneau || !formData.titre_cours) { 
      setFormMsg('❌ Sélectionnez un créneau et saisissez un titre.')
      return
    }

    initSignaturePads()

    if (!signaturePadDelegue.current || signaturePadDelegue.current.isEmpty()) {
      setFormMsg('❌ La signature du délégué est obligatoire.')
      return
    }

    // Si l'enseignant a signé, on peut aussi envoyer sa signature, mais ce n'est pas obligatoire à ce stade
    setSaving(true)
    try {
      const resCreate = await fetch(`${import.meta.env.VITE_API_URL}/Cahiers.php`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id_creneau: parseInt(formData.id_creneau),
          titre_cours: formData.titre_cours,
          contenu_json: formData.contenu
            ? { texte: formData.contenu, points_vus: formData.points_vus }
            : null,
          niveau_avancement: formData.niveau_avancement ? parseInt(formData.niveau_avancement) : null,
          observations: formData.observations || null,
          travaux: formData.travaux_demandes
            ? [{ description: formData.travaux_demandes, type: 'devoir' }]
            : []
        })//on envoie les données du formulaire, avec le contenu et les points vus regroupés dans un champ contenu_json, et les travaux demandés regroupés dans un tableau travaux pour faciliter la gestion côté API
      })
      const jsonCreate = await resCreate.json() //on vérifie la réponse de l'API, si success est false, on affiche le message d'erreur et on arrête le processus de sauvegarde

      if (!jsonCreate.success) {
        setFormMsg(`❌ ${jsonCreate.message}`)
        setSaving(false)
        return
      }

      // Ensuite, on envoie la signature du délégué pour ce cahier nouvellement créé
      const resSign = await fetch(
        `${import.meta.env.VITE_API_URL}/Cahiers.php?id=${jsonCreate.id}&action=signer`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ signature_base64: signaturePadDelegue.current.toDataURL() })
        }
      )
      const jsonSign = await resSign.json()

      if (!jsonSign.success) {
        setFormMsg(`⚠️ Cahier créé mais signature échouée : ${jsonSign.message}`)
      } else {
        setFormMsg('✅ Cahier créé et signé.')
      }

      // Rafraîchit la liste des cahiers pour afficher le nouveau cahier
      await fetchCahiers()
      setShowForm(false)
    } catch (err) {
      setFormMsg('❌ Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Clôture du cahier par l'enseignant :
  // POST /Cahiers.php?id=X&action=cloturer avec heure_fin + signature_base64
  const handleCloturer = async () => {
    setClotureMsg('')

    if (!heureFin) {
      setClotureMsg('❌ Veuillez saisir l\'heure de fin de séance.')
      return
    }

    if (!signaturePadCloture.current || signaturePadCloture.current.isEmpty()) {
      setClotureMsg('❌ La signature est obligatoire.')
      return
    }

    // Envoie la requête de clôture avec l'heure de fin et la signature de l'enseignants
    setClotureSaving(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/Cahiers.php?id=${currentCahier.id}&action=cloturer`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            heure_fin: heureFin,
            signature_base64: signaturePadCloture.current.toDataURL()//on envoie la signature de clôture au format base64 pour que l'API puisse la stocker et l'associer au cahier
          })
        }
      )
      const json = await res.json()

      if (json.success) {
        setClotureMsg('✅ Cahier clôturé avec succès.')
        await fetchCahiers()
        setCurrentCahier(null)
      } else {
        setClotureMsg(`❌ ${json.message}`)
      }
    } catch (err) {
      setClotureMsg('❌ Erreur : ' + err.message)
    } finally {
      setClotureSaving(false)
    }
  }

  // Gestion des changements dans le formulaire de création
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Affichage principal : liste des cahiers, formulaire de création ou vue d'un cahier selon l'état
  return (
    <DashboardLayout>
      <h2>Cahiers de Texte</h2>

      {/* Liste des cahiers */}
      {!showForm && !currentCahier && (
        <>
          {user?.role === 'delegue' && (
            <button className="btn-create" onClick={handleCreateCahier}>+ Nouveau cahier</button>
          )}

          {loading && <p style={{ color: '#888', margin: '12px 0' }}>Chargement...</p>}
          {error && <p style={{ color: 'red', margin: '12px 0' }}>{error}</p>}

          <div className="cahier-table-container">
            <table className="cahier-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Date</th>
                  <th>Titre du Cours</th>
                  <th>Enseignant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cahiers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#888' }}>
                      Aucun cahier trouvé.
                    </td>
                  </tr>
                )}
                {/* Affiche les cahiers avec leurs informations principales. Le bouton d'action affiche "Signer" pour l'enseignant si le cahier est signé par le délégué, sinon "Voir" 
                */}
                {cahiers.map(cahier => (
                  <tr key={cahier.id}>
                    <td>{cahier.classe}</td>
                    <td>{cahier.matiere}</td>
                    <td>{(cahier.date_creation || '').substring(0, 10)}</td>
                    <td>{cahier.titre_cours || '-'}</td>
                    <td>{cahier.enseignant_nom} {cahier.enseignant_prenom}</td>
                    <td>
                      <span className={`badge badge-${cahier.statut?.toLowerCase().replace('_', '-')}`}>
                        {cahier.statut}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action" onClick={() => setCurrentCahier(cahier)}>
                        {user?.role === 'enseignant' && cahier.statut === 'signe_delegue'
                          ? 'Signer'
                          : 'Voir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Formulaire de création (délégué uniquement) */}
      {showForm && (
        <div className="cahier-form-container">
          <div className="cahier-form-card">
            <h4>Nouveau Cahier de Texte</h4>

            {formMsg && <p style={{ marginBottom: '12px', fontWeight: 500 }}>{formMsg}</p>}

            <div className="form-group">
              <label>Créneau *</label>
              <select name="id_creneau" value={formData.id_creneau} onChange={handleInputChange}>
                <option value="">Sélectionner un créneau</option>
                {creneauxDispo.length === 0 && (
                  <option disabled>Aucun créneau disponible cette semaine</option>
                )}
                {creneauxDispo.map(cr => (
                  <option key={cr.id_creneau} value={cr.id_creneau}>
                    {cr.jour} {cr.heure_debut?.substring(0, 5)} — {cr.matiere} ({cr.enseignant_nom})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Titre du Cours *</label>
              <input
                type="text" name="titre_cours" value={formData.titre_cours}
                onChange={handleInputChange} placeholder="Ex: Chapitre 3 - Les Boucles"
              />
            </div>

            <div className="form-group">
              <label>Contenu du Cours</label>
              <textarea
                name="contenu" value={formData.contenu}
                onChange={handleInputChange} placeholder="Détails du contenu..." rows="3"
              />
            </div>

            <div className="form-group">
              <label>Points Vus</label>
              <textarea
                name="points_vus" value={formData.points_vus}
                onChange={handleInputChange} placeholder="Notions couvertes..." rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Avancement (%)</label>
                <input
                  type="number" name="niveau_avancement" value={formData.niveau_avancement}
                  onChange={handleInputChange} placeholder="Ex: 75" min="0" max="100"
                />
              </div>
              <div className="form-group">
                <label>Travaux Demandés</label>
                <input
                  type="text" name="travaux_demandes" value={formData.travaux_demandes}
                  onChange={handleInputChange} placeholder="Ex: Exercices 1-5, page 25"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observations</label>
              <textarea
                name="observations" value={formData.observations}
                onChange={handleInputChange} placeholder="Incidents, absences, retards..." rows="2"
              />
            </div>

            <div className="signatures-section">
              <h5>Signatures Numériques</h5>
              <div className="signature-grid">
                <div className="signature-box">
                  <label>Signature Délégué *</label>
                  <canvas ref={canvasDelegueRef} className="signature-canvas" />
                  <button type="button" className="btn-clear" onClick={() => handleClearSignature('delegu')}>
                    Effacer
                  </button>
                </div>
                <div className="signature-box">
                  <label>Signature Enseignant (optionnel)</label>
                  <canvas ref={canvasEnseignantRef} className="signature-canvas" />
                  <button type="button" className="btn-clear" onClick={() => handleClearSignature('enseignant')}>
                    Effacer
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-save" onClick={handleSaveCahier} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer et Signer'}
              </button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Vue d'un cahier + clôture enseignant */}
      {currentCahier && (
        <div className="cahier-view-container">
          <button className="btn-back" onClick={() => setCurrentCahier(null)}>← Retour</button>

          <div className="cahier-view-card"> {/* Affiche les détails du cahier sélectionné, avec une section de clôture visible uniquement pour l'enseignant si le cahier est signé par le délégué. */}
            <div className="cahier-header">
              <div>
                <h4>{currentCahier.titre_cours || 'Cahier de Texte'}</h4>
                <p>
                  <strong>Classe :</strong> {currentCahier.classe} &nbsp;|&nbsp;
                  <strong>Matière :</strong> {currentCahier.matiere} &nbsp;|&nbsp;
                  <strong>Date :</strong> {(currentCahier.date_creation || '').substring(0, 10)}
                </p>
              </div>
              <span className={`badge badge-${currentCahier.statut?.toLowerCase().replace('_', '-')}`}>
                {currentCahier.statut}
              </span>
            </div>

            <div className="cahier-content">
              {currentCahier.observations && (
                <div><strong>Observations :</strong> <p>{currentCahier.observations}</p></div>
              )}
              {currentCahier.niveau_avancement && (
                <div><strong>Avancement :</strong> <p>{currentCahier.niveau_avancement}%</p></div>
              )}
            </div>

            {/* Section clôture, visible uniquement pour l'enseignant sur un cahier signé par le délégué */}
            {user?.role === 'enseignant' && currentCahier.statut === 'signe_delegue' && (
              <div className="signatures-section" style={{ marginTop: '24px' }}>
                <h5>Clôturer la séance</h5>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
                  Le délégué a signé ce cahier. Vérifiez les informations, signez et indiquez l'heure de fin pour clôturer la séance.
                </p>

                <div className="form-group">
                  <label>Heure de fin de séance *</label>
                  <input
                    type="time"
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                  />
                </div>

                {/* Signature de clôture obligatoire pour l'enseignant, avec un bouton pour effacer la signature si besoin. */}
                <div className="signature-grid">
                  <div className="signature-box">
                    <label>Votre signature *</label>
                    <canvas ref={canvasClotureRef} className="signature-canvas" />
                    <button type="button" className="btn-clear" onClick={() => handleClearSignature('cloture')}>
                      Effacer
                    </button>
                  </div>
                </div>

                {clotureMsg && (
                  <p style={{ marginTop: '12px', fontWeight: 500 }}>{clotureMsg}</p>
                )}

                <div className="form-actions" style={{ marginTop: '16px' }}>
                  <button className="btn-save" onClick={handleCloturer} disabled={clotureSaving}>
                    {clotureSaving ? 'Clôture en cours...' : 'Signer et Clôturer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default CahierTexte
