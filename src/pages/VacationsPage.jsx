import DashboardLayout from '../components/DashboardLayout'
import './VacationsPage.css'
import { useState } from 'react'

function VacationsPage() {
  const [vacations, setVacations] = useState([
    {
      id: 1,
      enseignant: 'Jean Dupont',
      mois: 'Avril 2025',
      montant_brut: 45000,
      montant_net: 43200,
      statut: 'Validée',
      seances: [
        { date: '2025-04-07', matiere: 'Mathématiques', classe: 'L1', heure_debut: '07:30', heure_fin: '10:30', duree: 3, taux: 15000 },
        { date: '2025-04-08', matiere: 'Mathématiques', classe: 'L1', heure_debut: '08:00', heure_fin: '11:00', duree: 3, taux: 15000 }
      ],
      retenues: 1800,
      signature_enseignant: true,
      visa_surveillant: true,
      validation_comptable: true
    },
    {
      id: 2,
      enseignant: 'Marie Martin',
      mois: 'Avril 2025',
      montant_brut: 38000,
      montant_net: 0,
      statut: 'En attente',
      seances: [
        { date: '2025-04-09', matiere: 'Physique', classe: 'L2', heure_debut: '09:00', heure_fin: '12:00', duree: 3, taux: 12666.67 }
      ],
      retenues: 0,
      signature_enseignant: false,
      visa_surveillant: false,
      validation_comptable: false
    },
    {
      id: 3,
      enseignant: 'Pierre Bernard',
      mois: 'Avril 2025',
      montant_brut: 52000,
      montant_net: 49920,
      statut: 'Payée',
      seances: [
        { date: '2025-04-10', matiere: 'Dev Web', classe: 'L3', heure_debut: '14:00', heure_fin: '17:00', duree: 3, taux: 17333.33 }
      ],
      retenues: 2080,
      signature_enseignant: true,
      visa_surveillant: true,
      validation_comptable: true
    }
  ])

  const [selectedVacation, setSelectedVacation] = useState(null)
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  const handleGenerateFiches = () => {
    alert('📄 Génération des fiches de vacation pour le mois en cours...')
  }

  const handleViewDetails = (vacation) => {
    setSelectedVacation(vacation)
    setShowPDFPreview(false)
  }

  const handleSignEnseignant = (vacationId) => {
    setVacations(vacations.map(v => 
      v.id === vacationId ? { ...v, signature_enseignant: true } : v
    ))
    alert('✅ Signature enseignant enregistrée')
  }

  const handleVisaSurveillant = (vacationId) => {
    setVacations(vacations.map(v => 
      v.id === vacationId ? { ...v, visa_surveillant: true } : v
    ))
    alert('✅ Visa surveillant enregistré')
  }

  const handleValidationComptable = (vacationId) => {
    setVacations(vacations.map(v => 
      v.id === vacationId ? { ...v, validation_comptable: true, statut: 'Payée' } : v
    ))
    alert('✅ Validation comptable effectuée - Bon de paiement généré')
  }

  const generatePDF = (vacation) => {
    alert(`📥 Téléchargement de la fiche PDF de ${vacation.enseignant} pour ${vacation.mois}`)
  }

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

          {/* TABLEAU DES SÉANCES */}
          <div className="seances-section">
            <h4>📋 Détail des Séances</h4>
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
                      <td>{(seance.duree * seance.taux).toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RÉSUMÉ FINANCIER */}
          <div className="resume-section">
            <div className="resume-grid">
              <div className="resume-item">
                <label>Total Heures</label>
                <p className="big">{selectedVacation.seances.reduce((sum, s) => sum + s.duree, 0)}h</p>
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

          {/* VALIDATIONS */}
          <div className="validations-section">
            <h4>✅ Chaîne de Validation</h4>
            
            <div className="validation-steps">
              <div className={`step ${selectedVacation.signature_enseignant ? 'completed' : ''}`}>
                <div className="step-icon">1</div>
                <div className="step-content">
                  <h5>Signature Enseignant</h5>
                  {!selectedVacation.signature_enseignant ? (
                    <button className="btn-validate" onClick={() => handleSignEnseignant(selectedVacation.id)}>
                      ✍️ Signer
                    </button>
                  ) : (
                    <p className="text-success">✅ Signé</p>
                  )}
                </div>
              </div>

              <div className={`step ${selectedVacation.visa_surveillant ? 'completed' : ''}`}>
                <div className="step-icon">2</div>
                <div className="step-content">
                  <h5>Visa Surveillant</h5>
                  {!selectedVacation.visa_surveillant ? (
                    <button className="btn-validate" onClick={() => handleVisaSurveillant(selectedVacation.id)}>
                      🔒 Valider
                    </button>
                  ) : (
                    <p className="text-success">✅ Validé</p>
                  )}
                </div>
              </div>

              <div className={`step ${selectedVacation.validation_comptable ? 'completed' : ''}`}>
                <div className="step-icon">3</div>
                <div className="step-content">
                  <h5>Validation Comptable</h5>
                  {!selectedVacation.validation_comptable ? (
                    <button className="btn-validate" onClick={() => handleValidationComptable(selectedVacation.id)}>
                      💰 Approuver
                    </button>
                  ) : (
                    <p className="text-success">✅ Approuvé</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="detail-actions">
            <button className="btn-primary" onClick={() => { setShowPDFPreview(!showPDFPreview) }}>
              📄 {showPDFPreview ? 'Masquer' : 'Aperçu'} PDF
            </button>
            <button className="btn-download" onClick={() => generatePDF(selectedVacation)}>
              📥 Télécharger PDF
            </button>
          </div>

          {showPDFPreview && (
            <div className="pdf-preview">
              <h5>Aperçu PDF</h5>
              <div className="pdf-content">
                <p>📄 Fiche de Vacation - {selectedVacation.enseignant}</p>
                <p>Période: {selectedVacation.mois}</p>
                <p>Montant Net: <strong>{selectedVacation.montant_net.toLocaleString('fr-FR')} FCFA</strong></p>
                <p style={{marginTop: '20px', fontSize: '12px', color: 'gray'}}>
                  [Ceci est un aperçu. Le PDF complet inclura tous les détails, les signatures et les validations]
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <h2>Fiches de Vacation</h2>

      <button className="btn-generate" onClick={handleGenerateFiches}>📄 Générer fiches du mois</button>

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
              <th>Validations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacations.map(vacation => (
              <tr key={vacation.id}>
                <td><strong>{vacation.enseignant}</strong></td>
                <td>{vacation.mois}</td>
                <td>{vacation.seances.reduce((sum, s) => sum + s.duree, 0)}h</td>
                <td>{vacation.montant_brut.toLocaleString('fr-FR')} FCFA</td>
                <td className="montant-net">{vacation.montant_net.toLocaleString('fr-FR')} FCFA</td>
                <td><span className={`status-badge status-${vacation.statut.toLowerCase().replace(' ', '-')}`}>{vacation.statut}</span></td>
                <td>
                  <div className="validation-indicators">
                    <span className={vacation.signature_enseignant ? 'indicator-ok' : 'indicator-pending'} title="Signature Enseignant">✍️</span>
                    <span className={vacation.visa_surveillant ? 'indicator-ok' : 'indicator-pending'} title="Visa Surveillant">🔒</span>
                    <span className={vacation.validation_comptable ? 'indicator-ok' : 'indicator-pending'} title="Validation Comptable">💰</span>
                  </div>
                </td>
                <td>
                  <button className="btn-view" onClick={() => handleViewDetails(vacation)}>Voir Détails</button>
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