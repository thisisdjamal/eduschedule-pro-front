import DashboardLayout from '../components/DashboardLayout'
import './DashboardPage.css'
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function DashboardPage() {
  const [stats] = useState({
    seancesAujourdhui: 5,
    tauxPresence: 92,
    alertes: 2,
    cahiersSignes: 18,
    cahiersBrouillon: 3,
    seancesNonPointees: 1
  })

  const dataHeures = [
    { classe: 'Licence 1', planifiees: 40, realisees: 38 },
    { classe: 'Licence 2', planifiees: 35, realisees: 35 },
    { classe: 'Licence 3', planifiees: 30, realisees: 28 },
    { classe: 'Master 1', planifiees: 25, realisees: 25 }
  ]

  const dataAvancement = [
    { matiere: 'Mathématiques', valeur: 75 },
    { matiere: 'Physique', valeur: 60 },
    { matiere: 'Développement Web', valeur: 85 },
    { matiere: 'Sécurité Réseaux', valeur: 50 }
  ]

  const dataPresence = [
    { jour: 'Lun', pourcentage: 95 },
    { jour: 'Mar', pourcentage: 92 },
    { jour: 'Mer', pourcentage: 88 },
    { jour: 'Jeu', pourcentage: 96 },
    { jour: 'Ven', pourcentage: 90 },
    { jour: 'Sam', pourcentage: 85 }
  ]

  const COLORS = ['#0d6efd', '#28a745', '#ffc107', '#dc3545']

  const alertes = [
    { id: 1, type: 'Séance non pointée', message: 'Développement Web - Lundi 14h', severity: 'haute' },
    { id: 2, type: 'Cahier non signé', message: 'Mathématiques - Jeudi 10h', severity: 'moyenne' }
  ]

  return (
    <DashboardLayout>
      <h2>Tableau de Bord</h2>

      {/* CARTES KPI */}
      <div className="dashboard-grid">
        <div className="dashboard-card card-blue">
          <h6>Séances Aujourd'hui</h6>
          <h2>{stats.seancesAujourdhui}</h2>
          <p className="card-footer">En cours</p>
        </div>

        <div className="dashboard-card card-green">
          <h6>Taux de Présence</h6>
          <h2>{stats.tauxPresence}%</h2>
          <p className="card-footer">Enseignants présents</p>
        </div>

        <div className="dashboard-card card-yellow">
          <h6>Cahiers Signés</h6>
          <h2>{stats.cahiersSignes}</h2>
          <p className="card-footer">{stats.cahiersBrouillon} en brouillon</p>
        </div>

        <div className="dashboard-card card-red">
          <h6>Alertes</h6>
          <h2>{stats.alertes}</h2>
          <p className="card-footer">À traiter</p>
        </div>
      </div>

      {/* ALERTES */}
      <div className="alertes-section">
        <h4>⚠️ Alertes en Temps Réel</h4>
        {alertes.map(alerte => (
          <div key={alerte.id} className={`alerte alerte-${alerte.severity}`}>
            <strong>{alerte.type}</strong>
            <p>{alerte.message}</p>
          </div>
        ))}
      </div>

      {/* GRAPHIQUES */}
      <div className="charts-grid">
        
        {/* Heures Planifiées vs Réalisées */}
        <div className="chart-container">
          <h4>Heures Planifiées vs Réalisées par Classe</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataHeures}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="classe" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planifiees" fill="#0d6efd" />
              <Bar dataKey="realisees" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Taux de Présence Hebdomadaire */}
        <div className="chart-container">
          <h4>Taux de Présence Hebdomadaire</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataPresence}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pourcentage" stroke="#0d6efd" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Avancement des Programmes */}
        <div className="chart-container">
          <h4>Avancement des Programmes par Matière</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataAvancement}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ matiere, valeur }) => `${matiere}: ${valeur}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valeur"
              >
                {dataAvancement.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default DashboardPage