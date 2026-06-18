import DashboardLayout from '../components/DashboardLayout'
import './DashboardAdmin.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#28a745', '#ffc107', '#dc3545', '#0d6efd']

function DashboardAdmin() {
  const { token } = useAuth()// Récupère le token d'authentification depuis le contexte pour les requêtes API

  // États pour stocker les données du dashboard, les données du graphique, les alertes, et les états de chargement et d'erreur
  const [stats, setStats] = useState(null)
  const [pieData, setPieData] = useState([])
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect pour charger les données du dashboard à l'initialisation et à chaque changement de token
  useEffect(() => {
    fetchDashboard()
  }, [token])

  const fetchDashboard = async () => {// Fonction pour récupérer les données du dashboard depuis l'API
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/Dashboard.php`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const json = await res.json()

      if (json.success) {
        const data = json.data
        setStats(data)

        // Formate les statuts pour le camembert recharts
        setPieData(
          (data.repartition_statuts || []).map(r => ({
            name: traduireStatut(r.statut),
            value: parseInt(r.nb)
          }))
        )

        // Génère les alertes depuis les compteurs retournés par l'API
        const liste = []
        if (data.alertes_retards > 0) {// Si le nombre de retards/absences signalés aujourd'hui est supérieur à 0, ajoute une alerte de gravité haute à la liste des alertes
          liste.push({
            id: 1,
            severity: 'haute',
            type: 'Retards / Absences',
            message: `${data.alertes_retards} pointage(s) signalé(s) aujourd'hui`
          })
        }
        if (data.cahiers_non_signes > 0) {// Si le nombre de cahiers en brouillon est supérieur à 0, ajoute une alerte de gravité moyenne à la liste des alertes
          liste.push({
            id: 2,
            severity: 'moyenne',
            type: 'Cahiers non signés',
            message: `${data.cahiers_non_signes} cahier(s) en brouillon`
          })
        }
        if (data.vacations_en_attente > 0) {// Si le nombre de vacations en attente de validation est supérieur à 0, ajoute une alerte de gravité moyenne à la liste des alertes
          liste.push({
            id: 3,
            severity: 'moyenne',
            type: 'Vacations en attente',
            message: `${data.vacations_en_attente} fiche(s) à valider`
          })
        }
        setAlertes(liste)
      } else {
        setError(json.message || 'Erreur lors du chargement')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const traduireStatut = (statut) => {// Fonction pour traduire les statuts techniques en libellés plus lisibles pour le graphique
    const labels = { valide: 'Valide', retard: 'Retard', absent: 'Absent' }
    return labels[statut] || statut
  }

  return (
    <DashboardLayout>
      <h2>Tableau de Bord</h2>

      {loading && <p style={{ color: '#888', marginBottom: '12px' }}>Chargement...</p>}
      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

      {/* Cartes KPI */}
      <div className="dashboard-grid">
        <div className="dashboard-card card-blue">
          <h6>Séances Aujourd'hui</h6>
          <h2>{stats?.seances_jour ?? '—'}</h2>
          <p className="card-footer">Pointées : {stats?.pointages_jour ?? 0}</p>
        </div>
        <div className="dashboard-card card-green">
          <h6>Taux de Présence</h6>
          <h2>{stats?.taux_presence ?? '—'}%</h2>
          <p className="card-footer">Semaine en cours</p>
        </div>
        <div className="dashboard-card card-yellow">
          <h6>Vacations en Attente</h6>
          <h2>{stats?.vacations_en_attente ?? '—'}</h2>
          <p className="card-footer">{stats?.cahiers_non_signes ?? 0} cahier(s) brouillon</p>
        </div>
        <div className="dashboard-card card-red">
          <h6>Alertes</h6>
          <h2>{stats?.alertes_retards ?? '—'}</h2>
          <p className="card-footer">Retards / Absences</p>
        </div>
      </div>

      {/* Alertes temps réel */}
      <div className="alertes-section">
        <h4>⚠️ Alertes en Temps Réel</h4>
        {!loading && alertes.length === 0 && (
          <p style={{ color: '#28a745', fontSize: '14px' }}>✅ Aucune alerte aujourd'hui</p>
        )}
        {alertes.map(a => (
          <div key={a.id} className={`alerte alerte-${a.severity}`}>
            <strong>{a.type}</strong>
            <p>{a.message}</p>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="charts-grid">

        {/* Répartition des pointages par statut */}
        <div className="chart-container">
          <h4>Répartition des Pointages (Semaine)</h4>
          {!loading && pieData.length === 0 ? (
            <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', paddingTop: '60px' }}>
              Aucun pointage enregistré cette semaine.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Taux de présence global de la semaine */}
        <div className="chart-container">
          <h4>Taux de Présence — Semaine en Cours</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats ? [{ periode: 'Cette semaine', taux: stats.taux_presence }] : []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periode" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="taux" fill="#0d6efd" name="Taux de présence" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default DashboardAdmin
