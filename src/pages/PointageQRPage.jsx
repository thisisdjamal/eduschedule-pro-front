import DashboardLayout from '../components/DashboardLayout'
import './PointageQRPage.css'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Html5QrcodeScanner } from 'html5-qrcode'

const API_BASE = import.meta.env.VITE_API_URL

function PointageQRPage() {
  const { user, token } = useAuth()

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // États pour la génération
  const [emplois, setEmplois] = useState([])
  const [selectedEmploi, setSelectedEmploi] = useState('')
  const [creneaux, setCreneaux] = useState([])
  const [selectedCreneau, setSelectedCreneau] = useState('')
  const [qrImage, setQrImage] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')

  // États pour le scan et historique
  const [qrCode, setQrCode] = useState('')
  const [scanStatus, setScanStatus] = useState(null)
  const [scanMessage, setScanMessage] = useState('')
  const [scanning, setScanning] = useState(false)
  const [seanceInfo, setSeanceInfo] = useState(null)
  const [showScanner, setShowScanner] = useState(false) 
  const [historique, setHistorique] = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const inputRef = useRef()

  const isAdminOrSurveillant = user?.role === 'admin' || user?.role === 'surveillant'
  const isEnseignant = user?.role === 'enseignant'

  useEffect(() => {
    if (isAdminOrSurveillant) {
      fetchEmplois()
      fetchHistorique()
    }
  }, [token])

  // --- LOGIQUE SCANNER ---
  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("qr-reader-container", { fps: 10, qrbox: 250 }, false);
      scanner.render((text) => { setQrCode(text); setShowScanner(false); }, () => {});
    }
    return () => { if (scanner) scanner.clear().catch(e => console.error(e)); };
  }, [showScanner]);

  // --- FONCTIONS API ---
  const fetchEmplois = async () => {
    try {
      const res = await fetch(`${API_BASE}/Emploie_du_temps.php`, { headers })
      const json = await res.json()
      if (json.success) setEmplois(json.data || [])
    } catch (err) { console.error(err) }
  }

  const handleSelectEmploi = async (id) => {
    setSelectedEmploi(id)
    setSelectedCreneau('')
    setQrImage(null)
    setCreneaux([])
    if (!id) return
    try {
      const res = await fetch(`${API_BASE}/Emploie_du_temps.php?id=${id}`, { headers })
      const json = await res.json()
      if (json.success) setCreneaux(json.data.creneaux || [])
    } catch (err) { console.error(err) }
  }

  // --- LA FONCTION MAGIQUE (Unique et automatique) ---
  const handleSelectCreneau = async (id) => {
    setSelectedCreneau(id);
    setQrImage(null);
    setQrError('');
    
    if (!id) return;

    setQrLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Qrcode.php?id=${id}`, { headers });
      
      // Vérifier si la réponse est bien du JSON avant de la lire
      const text = await res.text(); 
      try {
        const json = JSON.parse(text);
        if (json.success) {
          const imgData = json.qr_code.startsWith('data:image') 
              ? json.qr_code 
              : `data:image/png;base64,${json.qr_code}`;
          setQrImage(imgData);
        } else {
          setQrError(json.message || 'Erreur lors de la génération');
        }
      } catch (e) {
        // Si on arrive ici, c'est que 'text' contient du HTML (l'erreur PHP)
        console.error("Réponse brute du serveur :", text);
        setQrError("Erreur critique du serveur (voir console)");
      }
    } catch (err) {
      setQrError('Erreur de connexion au serveur');
    } finally {
      setQrLoading(false);
    }
  };

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!qrCode.trim()) return;
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/Pointages.php?action=scan`, {
        method: 'POST', headers, body: JSON.stringify({ token_qr: qrCode })
      });
      const data = await res.json();
      setScanStatus(data.success ? 'success' : 'error');
      setScanMessage(data.message);
      if (data.success) { setSeanceInfo(data.seance); setQrCode(''); }
    } catch (err) { setScanStatus('error'); setScanMessage('Erreur serveur');
    } finally { setScanning(false); }
  }

  const fetchHistorique = async () => {
    setHistLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Pointages.php`, { headers });
      const json = await res.json();
      if (json.success) setHistorique(json.data || []);
    } finally { setHistLoading(false); }
  }

  // Helpers formatage
  const formatHeure = (dt) => dt ? dt.substring(11, 16) : '—';
  const formatDate = (dt) => dt ? dt.substring(0, 10) : '—';

  return (
    <DashboardLayout>
      <h2>Pointage QR-Code</h2>
      <div className="pointage-container">
        
        {isAdminOrSurveillant && (
          <div className="scan-card">
            <h4>Générer le QR Code</h4>
            <div className="form-group">
              <label>Emploi du temps</label>
              <select value={selectedEmploi} onChange={(e) => handleSelectEmploi(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {emplois.map(et => (
                  <option key={et.id} value={et.id}>{et.classe_libelle} — {et.semaine_debut}</option>
                ))}
              </select>
            </div>

            {creneaux.length > 0 && (
              <div className="form-group">
                <label>Créneau</label>
                <select value={selectedCreneau} onChange={(e) => handleSelectCreneau(e.target.value)}>
                  <option value="">-- Sélectionner un créneau --</option>
                  {creneaux.map(cr => (
                    <option key={cr.id} value={cr.id}>
                      {cr.jour} {cr.heure_debut?.substring(0, 5)} — {cr.matiere_libelle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {qrLoading && <p>Génération du QR Code...</p>}
            {qrError && <div className="alert alert-error">{qrError}</div>}

            {qrImage && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <img src={qrImage} alt="QR Code" style={{ width: '200px', border: '3px solid #194789', borderRadius: '12px', padding: '10px' }} />
                <p style={{ fontSize: '12px', color: '#888' }}>Scannez ce code pour valider la présence.</p>
              </div>
            )}
          </div>
        )}

        {isEnseignant && (
          <div className="scan-card">
            <h4>Scanner le QR-Code</h4>
            <button className="btn-scan" onClick={() => setShowScanner(!showScanner)}>
              {showScanner ? 'Fermer la caméra' : 'Ouvrir la caméra'}
            </button>
            {showScanner && <div id="qr-reader-container" style={{ marginTop: '10px' }}></div>}
            
            <form onSubmit={handleScan} style={{ marginTop: '15px' }}>
              <input type="text" value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Token QR..." className="qr-input" />
              <button type="submit" className="btn-scan" disabled={scanning || !qrCode}>Valider</button>
            </form>
            {scanMessage && <div className={`alert alert-${scanStatus}`}>{scanMessage}</div>}
          </div>
        )}

        {/* Historique simplifié */}
        {isAdminOrSurveillant && (
          <div className="historique-card">
            <h4>Derniers Pointages</h4>
            <div className="historique-table">
              <table>
                <thead><tr><th>Date</th><th>Matière</th><th>Heure</th><th>Statut</th></tr></thead>
                <tbody>
                  {historique.map(p => (
                    <tr key={p.id}>
                      <td>{formatDate(p.heure_pointage_reelle)}</td>
                      <td>{p.matiere}</td>
                      <td>{formatHeure(p.heure_pointage_reelle)}</td>
                      <td><span className={`badge badge-${p.statut?.toLowerCase()}`}>{p.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PointageQRPage