import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ProtectedRoute — double vérification :
// 1. L'utilisateur doit être connecté (token présent)
// 2. Son rôle doit figurer dans la liste allowedRoles de la route
function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuth()

  // Si aucun token n'est présent, l'utilisateur n'est pas connecté
  // redirection immédiate vers la page de login
  if (!token) {
    return <Navigate to="/login" />
  }

  // Si des rôles autorisés sont définis et que le rôle de l'utilisateur
  // ne figure pas dans la liste, on le redirige vers le login
  // (accès refusé sans déconnexion)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />
  }

  // Token valide + rôle autorisé → affichage de la page demandée
  return children
}

export default ProtectedRoute
