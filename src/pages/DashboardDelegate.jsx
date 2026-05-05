import DashboardLayout from '../components/DashboardLayout'
import './DashboardDelegate.css'
import { useState } from 'react'

function DashboardDelegate() {
  const [showForm, setShowForm]= useState(false)
  const [mesCahiers] = useState([
    { id: 1, matiere: 'Mathématiques', enseignant: 'M. SANOGO', date: '2025-04-17', statut: 'À remplir' },
    { id: 2, matiere: 'Physique', enseignant: 'Dr BERE', date: '2025-04-16', statut: 'Signé' },
  ])

  const [emploiTemps] = useState([
    { jour: 'Lundi', matiere: 'Mathématiques', heure: '07:30-09:30', enseignant: 'M. SANOGO' },
    { jour: 'Mardi', matiere: 'Physique', heure: '08:00-11:00', enseignant: 'Dr BERE' },
    { jour: 'Mercredi', matiere: 'Développement Web', heure: '08:30-12:30', enseignant: 'Dr BERE' },
  ])

  return (
    <DashboardLayout>
      <h2>Tableau de Bord Délégué</h2>

      <div className="delegate-grid">
        
        {/* EMPLOI DU TEMPS */}
        <div className="card">
          <h4> Emploi du Temps de Ma Classe</h4>
          <div className="emploi-list">
            {emploiTemps.map((cours, idx) => (
              <div key={idx} className="cours-item">
                <div>
                  <p className="jour">{cours.jour}</p>
                  <p className="matiere">{cours.matiere}</p>
                  <p className="details">{cours.heure} - {cours.enseignant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAHIERS À REMPLIR */}
        <div className="card">
          <h4> Cahiers de Texte à Remplir</h4>
          <div className="cahiers-list">
            {mesCahiers.map(cahier => (
              <div key={cahier.id} className="cahier-item">
                <div>
                  <p className="matiere-cahier">{cahier.matiere}</p>
                  <p className="info">{cahier.enseignant} - {cahier.date}</p>
                </div>
                <span className={`badge badge-${cahier.statut.toLowerCase().replace(' ', '-')}`}>
                  {cahier.statut}
                </span>
              </div>
            ))}
          </div>
         
        </div>

      </div>

      <div className="card">
        <h4> Mon Activité</h4>
        <div className="activity-grid">
          <div className="activity-box">
            <label>Cahiers Signés</label>
            <p className="big">12</p>
          </div>
          <div className="activity-box">
            <label>Cahiers en Attente</label>
            <p className="big text-warning">3</p>
          </div>
          <div className="activity-box">
            <label>Classe</label>
            <p className="big">Licence 1</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardDelegate