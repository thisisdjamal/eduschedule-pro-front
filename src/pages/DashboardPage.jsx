import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardAdmin from './DashboardAdmin'
import DashboardEnseignant from './DashboardEnseignant'
import DashboardDelegate from './DashboardDelegate'
import VacationsPage from './VacationsPage'

// DashboardPage — routeur de rôle :
// Redirige chaque utilisateur vers le tableau de bord correspondant à son rôle.
// Les rôles non listés ici (comptable, étudiant) sont gérés
// par leurs propres pages dédiées ou redirigés.
function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // L'étudiant n'a pas de tableau de bord — on le redirige vers son emploi du temps
  useEffect(() => {
    
    if (user?.role === 'etudiant') {
      navigate('/emploi-temps', { replace: true })
    }
    if (user?.role === 'surveillant' || user?.role === 'comptable') {
      navigate('/vacations', { replace: true })
    }
  }, [user, navigate])

    // Pendant que user est null (chargement initial), on n'affiche rien
  if (!user) return null

  switch(user?.role) {
    case 'admin':
      return <DashboardAdmin />
    case 'enseignant':
      return <DashboardEnseignant />
    case 'delegue':
      return <DashboardDelegate />
    case 'surveillant':
    case 'comptable':
      // Ces rôles n'ont pas de dashboard centralisé — ils accèdent à des pages spécifiques
      // La redirection est assurée en amont par ProtectedRoute
      return null
    default:
      // Rôle non géré par ce dashboard (ex: comptable, surveillant)
      // La redirection est assurée en amont par ProtectedRoute
      return null
  }
}

export default DashboardPage
