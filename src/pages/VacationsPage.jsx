import DashboardLayout from '../components/DashboardLayout'
import './VacationsPage.css'
import { useState } from 'react'

function VacationsPage() {
  const [vacations, setVacations] = useState([
    { id: 1, enseignant: 'Jean Dupont', mois: 'Avril 2025', montant: '45000 FCFA', statut: 'Validée' },
    { id: 2, enseignant: 'Marie Martin', mois: 'Avril 2025', montant: '38000 FCFA', statut: 'En attente' },
    { id: 3, enseignant: 'Pierre Bernard', mois: 'Avril 2025', montant: '52000 FCFA', statut: 'Payée' },
  ])

  return (
    <DashboardLayout>
      <h2>Fiches de Vacation</h2>

      <button className="btn-generate">📄 Générer fiches</button>

      <div className="vacation-table-container">
        <table className="vacation-table">
          <thead>
            <tr>
              <th>Enseignant</th>
              <th>Période</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacations.map(vacation => (
              <tr key={vacation.id}>
                <td>{vacation.enseignant}</td>
                <td>{vacation.mois}</td>
                <td className="montant">{vacation.montant}</td>
                <td><span className={`status-badge status-${vacation.statut.toLowerCase().replace(' ', '-')}`}>{vacation.statut}</span></td>
                <td>
                  <button className="btn-view">Voir</button>
                  <button className="btn-pdf">PDF</button>
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