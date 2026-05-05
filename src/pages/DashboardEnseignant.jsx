import DashboardLayout from '../components/DashboardLayout'
import './DashboardEnseignant.css'
import { useState } from 'react'

function DashboardEnseignant() {
  const [mesSeances] = useState([
    { id: 1, matiere: 'Mathématiques', classe: 'Licence 1', jour: 'Lundi', heure: '07:30-09:30', statut: 'Pointée' },
    { id: 2, matiere: 'Mathématiques', classe: 'Licence 1', jour: 'Mercredi', heure: '08:00-11:00', statut: 'À venir' },
    { id: 3, matiere: 'Mathématiques', classe: 'Licence 2', jour: 'Jeudi', heure: '14:00-17:00', statut: 'Pointée' },
  ])

  const [mesFiches] = useState([
    { id: 1, mois: 'Avril 2025', montant: '45000 FCFA', statut: 'Validée' },
    { id: 2, mois: 'Mars 2025', montant: '42000 FCFA', statut: 'Payée' },
  ])

  const [historiqueMensuel] = useState([
    { mois: 'Avril 2025', seances: 12, heures: 36, montant: '45000 FCFA', statut: 'En cours' },
    { mois: 'Mars 2025', seances: 11, heures: 33, montant: '42000 FCFA', statut: 'Payée' },
    { mois: 'Février 2025', seances: 10, heures: 30, montant: '38000 FCFA', statut: 'Payée' },
    { mois: 'Janvier 2025', seances: 13, heures: 39, montant: '50000 FCFA', statut: 'Payée' },
    { mois: 'Décembre 2024', seances: 9, heures: 27, montant: '35000 FCFA', statut: 'Payée' },
  ])

  return (
    <DashboardLayout>
      <h2>Mon Tableau de Bord</h2>

      <div className="enseignant-grid">
        
        {/* MES SÉANCES */}
        <div className="card">
          <h4> Mes Séances de la Semaine</h4>
          <div className="seances-list">
            {mesSeances.map(seance => (
              <div key={seance.id} className="seance-item">
                <div>
                  <p className="seance-matiere">{seance.matiere}</p>
                  <p className="seance-classe">{seance.classe} - {seance.jour} {seance.heure}</p>
                </div>
                <span className={`badge badge-${seance.statut.toLowerCase()}`}>{seance.statut}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MES FICHES DE VACATION */}
        <div className="card">
          <h4> Mes Fiches de Vacation</h4>
          <div className="fiches-list">
            {mesFiches.map(fiche => (
              <div key={fiche.id} className="fiche-item">
                <div>
                  <p className="fiche-mois">{fiche.mois}</p>
                  <p className="fiche-montant">{fiche.montant}</p>
                </div>
                <span className={`badge badge-${fiche.statut.toLowerCase()}`}>{fiche.statut}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="card">
        <h4> Statistiques Personnelles</h4>
        <div className="stats-grid">
          <div className="stat-box">
            <label>Heures Enseignées (Mois)</label>
            <p className="big">36h</p>
          </div>
          <div className="stat-box">
            <label>Montant à Percevoir</label>
            <p className="big text-success">45000 FCFA</p>
          </div>
          <div className="stat-box">
            <label>Taux de Présence</label>
            <p className="big">100%</p>
          </div>
        </div>
      </div>

      {/* HISTORIQUE MENSUEL */}
      <div className="card">
        <h4> Historique Mensuel de Mes Séances</h4>
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
              {historiqueMensuel.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.mois}</strong></td>
                  <td>{item.seances}</td>
                  <td>{item.heures}h</td>
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