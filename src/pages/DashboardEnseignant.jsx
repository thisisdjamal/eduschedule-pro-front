import DashboardLayout from '../components/DashboardLayout'
import './DashboardEnseignant.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function DashboardEnseignant() {//on récupère le token d'authentification depuis le contexte pour les requêtes API
  const { token } = useAuth()
  const navigate = useNavigate()

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
  // États pour stocker les données du dashboard, les cahiers à signer, et les états de chargement et d'erreur
  const [mesSeances, setMesSeances] = useState([])
  const [mesFiches, setMesFiches] = useState([])
  const [historiqueMensuel, setHistoriqueMensuel] = useState([])
  const [heuresMois, setHeuresMois] = useState(0)
  const [montantMois, setMontantMois] = useState(0)
  const [cahiersAsigner, setCahiersAsigner] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {//useEffect pour charger les données du dashboard et des cahiers à l'initialisation et à chaque changement de token
    fetchDashboard()
    fetchCahiersAsigner()
  }, [token])

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {//chargement des données du dashboard de l'enseignant connecté à travers son id à partir de l'API
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Dashboard.php`, { headers })
      const json = await res.json()

      if (json.success && json.role === 'enseignant') {
        const data = json.data

        setMesSeances(
          (data.seances_semaine || []).map(s => ({
            id: s.id,
            matiere: s.matiere,
            classe: s.classe,
            jour: s.jour,
            heure: `${s.heure_debut?.slice(0, 5) || ''}-${s.heure_fin?.slice(0, 5) || ''}`,
            statut: traduireStatutPointage(s.statut_pointage),
          }))
        )

        setMesFiches(
          (data.mes_vacations || []).map(v => ({
            id: v.id,
            mois: `${nomMois(v.mois)} ${v.annee}`,
            montant: `${Number(v.montant_net).toLocaleString('fr-FR')} FCFA`,
            statut: traduireStatutVacation(v.statut),
          }))
        )

        setHistoriqueMensuel(
          (data.mes_vacations || []).map(v => ({
            mois: `${nomMois(v.mois)} ${v.annee}`,
            seances: v.nb_seances ?? '-',
            heures: v.total_heures ?? '-',
            montant: `${Number(v.montant_net).toLocaleString('fr-FR')} FCFA`,
            statut: traduireStatutVacation(v.statut),
          }))
        )

        setHeuresMois(data.heures_ce_mois || 0)

        const now = new Date()
        const ficheMois = (data.mes_vacations || []).find(
          v => Number(v.mois) === now.getMonth() + 1 && Number(v.annee) === now.getFullYear()
        )
        setMontantMois(ficheMois ? Number(ficheMois.montant_net) : 0)

      } else {
        setError(json.message || 'Erreur chargement dashboard')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Charge les cahiers signés par le délégué qui attendent la signature de l'enseignant
  const fetchCahiersAsigner = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Cahiers.php`, { headers })
      const json = await res.json()
      if (json.success) {
        setCahiersAsigner(
          (json.data || []).filter(c => c.statut === 'signe_delegue')
        )
      }
    } catch (err) {
      console.error('Erreur cahiers à signer', err)
    }
  }

  // Fonction pour traduire les statuts techniques en libellés plus lisibles pour les séances
  const traduireStatutPointage = (statut) => {
    if (!statut) return 'À venir'
    if (statut === 'valide') return 'Pointée'
    if (statut === 'retard') return 'En retard'
    if (statut === 'absent') return 'Absent'
    return statut
  }

  // Fonction pour traduire les statuts techniques en libellés plus lisibles pour les fiches de vacation
  const traduireStatutVacation = (statut) => {
    if (statut === 'generee') return 'En attente'
    if (statut === 'signee_enseignant') return 'En attente'
    if (statut === 'validee_surveillant') return 'Validée'
    if (statut === 'approuvee_comptable') return 'Payée'
    return 'En attente'
  }

  const nomMois = (num) => {// Fonction pour obtenir le nom du mois à partir de son numéro
    const noms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return noms[Number(num)] || num
  }

  return (
    <DashboardLayout>
      <h2>Mon Tableau de Bord</h2>

      {loading && <p style={{ color: '#888', marginBottom: '12px' }}>Chargement...</p>}
      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

      {/* Alerte cahiers en attente de signature — apparaît seulement s'il y en a */}
      {cahiersAsigner.length > 0 && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderLeft: '5px solid #ffc107',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong>⚠️ {cahiersAsigner.length} cahier(s) en attente de votre signature</strong>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#555' }}>
              {cahiersAsigner.map(c => `${c.matiere} — ${c.classe}`).join(', ')}
            </p>
          </div>
          <button
            onClick={() => navigate('/cahiers')}
            style={{
              background: '#ffc107',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Aller signer →
          </button>
        </div>
      )}

      <div className="enseignant-grid">

        <div className="card">
          <h4>Mes Séances de la Semaine</h4>
          <div className="seances-list">
            {mesSeances.length === 0 && !loading && (
              <p style={{ color: '#888', fontSize: '13px' }}>Aucune séance cette semaine.</p>
            )}
            {mesSeances.map(seance => (
              <div key={seance.id} className="seance-item">
                <div>
                  <p className="seance-matiere">{seance.matiere}</p>
                  <p className="seance-classe">{seance.classe} - {seance.jour} {seance.heure}</p>
                </div>
                <span className={`badge badge-${seance.statut.toLowerCase().replace(' ', '-')}`}>
                  {seance.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

            {/* Les autres sections du dashboard (fiches de vacation, statistiques, historique) sont similaires et suivent la même logique de rendu conditionnel et de mapping des données */ }
        <div className="card">
          <h4>Mes Fiches de Vacation</h4>
          <div className="fiches-list">
            {mesFiches.length === 0 && !loading && (
              <p style={{ color: '#888', fontSize: '13px' }}>Aucune fiche de vacation.</p>
            )}
            {mesFiches.map(fiche => (
              <div key={fiche.id} className="fiche-item">
                <div>
                  <p className="fiche-mois">{fiche.mois}</p>
                  <p className="fiche-montant">{fiche.montant}</p>
                </div>
                <span className={`badge badge-${fiche.statut.toLowerCase().replace(' ', '-')}`}>
                  {fiche.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="card">
        <h4>Statistiques Personnelles</h4>
        <div className="stats-grid">
          <div className="stat-box">
            <label>Heures Enseignées (Mois)</label>
            <p className="big">{heuresMois}h</p>
          </div>
          <div className="stat-box">
            <label>Montant à Percevoir</label>
            <p className="big text-success">{montantMois.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="stat-box">
            <label>Taux de Présence</label>
            <p className="big">
              {mesSeances.length > 0
                ? `${Math.round((mesSeances.filter(s => s.statut === 'Pointée').length / mesSeances.length) * 100)}%`
                : '—'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h4>Historique Mensuel de Mes Séances</h4>
        <div className="historique-table">
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Nombre de Séances</th>
                <th>Heures Totales</th>
                <th>Montant Brut</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {historiqueMensuel.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>
                    Aucun historique disponible.
                  </td>
                </tr>
              )}
              {historiqueMensuel.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.mois}</strong></td>
                  <td>{item.seances}</td>
                  <td>{item.heures === '-' ? '-' : `${item.heures}h`}</td>
                  <td className="montant">{item.montant}</td>
                  <td>
                    <span className={`badge-status badge-${item.statut.toLowerCase().replace(' ', '-')}`}>
                      {item.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </DashboardLayout>
  )
}

export default DashboardEnseignant
