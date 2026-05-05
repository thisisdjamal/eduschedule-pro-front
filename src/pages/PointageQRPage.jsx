import DashboardLayout from '../components/DashboardLayout'
import './PointageQRPage.css'
import { useState, useRef } from 'react'

function PointageQRPage() {
  const [qrCode, setQrCode] = useState('')
  const [seanceInfo, setSeanceInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef()

  const handleScan = async (e) => {
    e.preventDefault()
    
    if (!qrCode.trim()) {
      setMessage('Veuillez entrer ou scanner un code QR')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus(null)
    setMessage('')

    try {
      const response = await fetch('http://localhost/eduschedule/api/pointages/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_qr: qrCode })
      })
      
      const data = await response.json()

      if (response.ok) {
        setSeanceInfo(data.seance)
        setStatus('success')
        setMessage('Pointage enregistré avec succès')
        setQrCode('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Erreur lors du scan')
        setSeanceInfo(null)
      }
    } catch (err) {
      setStatus('error')
      setMessage('Erreur de connexion au serveur')
      setSeanceInfo(null)
    }

    setIsLoading(false)
    inputRef.current?.focus()
  }

  return (
    <DashboardLayout>
      <h2>Pointage QR-Code</h2>

      <div className="pointage-container">
        
        {/* FORMULAIRE DE SCAN */}
        <div className="scan-card">
          <h4>Scanner le QR-Code de la séance</h4>
          
          <form onSubmit={handleScan}>
            <div className="form-group">
              <label>Code QR ou Token</label>
              <input
                ref={inputRef}
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Scannez le QR-Code ici..."
                className="qr-input"
                disabled={isLoading}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-scan">
              {isLoading ? ' Traitement...' : ' Valider le scan'}
            </button>
          </form>

          {message && (
            <div className={`alert alert-${status}`}>
              {message}
            </div>
          )}
        </div>

        {/* INFOS DE LA SÉANCE */}
        {seanceInfo && (
          <div className="seance-info">
            <h4>Séance en cours</h4>
          
            <div className="info-grid">
              <div className="info-item">
                <label>Matière</label>
                <p>{seanceInfo.matiere}</p>
              </div>
              
              <div className="info-item">
                <label>Classe</label>
                <p>{seanceInfo.classe}</p>
              </div>
              
              <div className="info-item">
                <label>Salle</label>
                <p>{seanceInfo.salle}</p>
              </div>
              
              <div className="info-item">
                <label>Heure Prévue</label>
                <p>{seanceInfo.heure_debut_prevue}</p>
              </div>
              
              <div className="info-item">
                <label>Heure Réelle</label>
                <p className={seanceInfo.retard ? 'text-warning' : 'text-success'}>
                  {seanceInfo.heure_debut_reelle}
                  {seanceInfo.retard && ' ⚠️ Retard'}
                </p>
              </div>
              
              <div className="info-item">
                <label>Statut</label>
                <p className={`badge badge-${seanceInfo.statut.toLowerCase()}`}>
                  {seanceInfo.statut}
                </p>
              </div>
            </div>

            <div className="seance-actions">
              <button className="btn-primary">Commencer la séance</button>
              <button className="btn-secondary">Nouveau scan</button>
            </div>
          </div>
        )}

        {/* HISTORIQUE DES POINTAGES */}
        <div className="historique-card">
          <h4> Historique des Pointages</h4>
          
          <div className="historique-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Classe</th>
                  <th>Heure Scan</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-04-23</td>
                  <td>Développement Web</td>
                  <td>Licence 1</td>
                  <td>07:58</td>
                  <td><span className="badge badge-present">Présent</span></td>
                </tr>
                <tr>
                  <td>2025-04-22</td>
                  <td>Mathématiques</td>
                  <td>Licence 1</td>
                  <td>08:15</td>
                  <td><span className="badge badge-retard">Retard</span></td>
                </tr>
                <tr>
                  <td>2025-04-21</td>
                  <td>Physique</td>
                  <td>Licence 2</td>
                  <td>07:30</td>
                  <td><span className="badge badge-present">Présent</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default PointageQRPage