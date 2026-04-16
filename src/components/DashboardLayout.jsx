import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#0d6efd', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ color: 'white', margin: 0 }}>EduSchedule Pro</h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}>👤 {user?.nom || 'Utilisateur'}</span>
          <button onClick={handleLogout} style={{ backgroundColor: 'white', color: '#0d6efd', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '220px', backgroundColor: '#343a40', minHeight: '100%', padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 20px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              📊 Tableau de bord
            </li>
            <li style={{ padding: '12px 20px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/emploi-temps')}>
              📅 Emploi du temps
            </li>
            <li style={{ padding: '12px 20px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/cahiers')}>
              📖 Cahier de texte
            </li>
            <li style={{ padding: '12px 20px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/vacations')}>
              💰 Vacations
            </li>
          </ul>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div style={{ flex: 1, padding: '30px', backgroundColor: '#f8f9fa' }}>
          {children}
        </div>

      </div>
    </div>
  )
}

export default DashboardLayout