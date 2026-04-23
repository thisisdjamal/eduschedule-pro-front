import DashboardLayout from '../components/DashboardLayout'
import './CahierTexte.css'
import { useState } from 'react'

function CahierTexte() {
  const [cahiers, setCahiers] = useState([
    { id: 1, classe: 'Licence 1', matiere: 'Mathématiques', date: '2025-04-17', statut: 'Signé' },
    { id: 2, classe: 'Licence 1', matiere: 'Physique', date: '2025-04-16', statut: 'Brouillon' },
  ])

  return (
    <DashboardLayout>
      <h2>Cahiers de Texte</h2>

      <button className="btn-create">+ Nouveau cahier</button>

      <div className="cahier-table-container">
        <table className="cahier-table">
          <thead>
            <tr>
              <th>Classe</th>
              <th>Matière</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cahiers.map(cahier => (
              <tr key={cahier.id}>
                <td>{cahier.classe}</td>
                <td>{cahier.matiere}</td>
                <td>{cahier.date}</td>
                <td><span className={`badge badge-${cahier.statut.toLowerCase()}`}>{cahier.statut}</span></td>
                <td>
                  <button className="btn-action">Voir</button>
                  <button className="btn-action">Éditer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

export default CahierTexte