import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './DashboardLayout.css'
import { useState } from 'react'

function DashboardLayout({ children }) {
  const { user, logout, role } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Menu items selon le rôle
  const getMenuItems = () => { // Items communs à tous les rôles
    const commonItems = [
      { label: 'Tableau de bord', icon: '📊', path: '/dashboard' }
    ]
    
    switch(role) // retourne les items selon le role 
    {
      case 'admin':
        return [
          ...commonItems,
          { label: 'Emploi du temps', icon: '📅', path: '/emploi-temps' },
          { label: 'Cahier de texte', icon: '📖', path: '/cahiers' },
          { label: 'Pointage QR', icon: '📱', path: '/pointage-qr' },
          { label: 'Vacations', icon: '💰', path: '/vacations' }
        ]
      case 'enseignant':
        return [
          ...commonItems,
          { label: 'Emploi du temps', icon: '📅', path: '/emploi-temps' },
          { label: 'Cahier de texte', icon: '📖', path: '/cahiers' },
          { label: 'Pointage QR', icon: '📱', path: '/pointage-qr' },
          { label: 'Vacations', icon: '💰', path: '/vacations' }
        ]
      case 'delegate':
        return [
          ...commonItems,
          { label: 'Emploi du temps', icon: '📅', path: '/emploi-temps' },
          { label: 'Cahier de texte', icon: '📖', path: '/cahiers' }
        ]
      case 'etudiant':
        return [
          { label: 'Emploi du temps', icon: '📅', path: '/emploi-temps' }
        ]
      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems() //recupere les items du menu selon le role
console.log('Role:', role)
console.log('Menu items:', menuItems)

  return (
    <div className="layout-container">

      <nav className="navbar">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h5 className="navbar-brand">EduSchedule Pro</h5>
        <div className="navbar-right">
          <span>👤 {user?.nom || 'Utilisateur'}</span>
          <button onClick={handleLogout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="layout-body">

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <ul className="sidebar-menu">
            {menuItems.map((item, idx) => (
              <li 
                key={idx}
                className="menu-item" 
                onClick={() => navigate(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          {children}
        </div>

      </div>
    </div>
  )
}

export default DashboardLayout