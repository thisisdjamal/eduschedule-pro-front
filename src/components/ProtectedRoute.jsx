import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) 
// Récupère le token du contexte d'authentification
  // Si token existe = utilisateur connecté
  // Si token est null = utilisateur non connecté
 {
  const { token } = useAuth()

   /**
   * VÉRIFICATION DE SÉCURITÉ
   * 
   * Si l'utilisateur n'a pas de token (pas connecté) :
   * - Le rediriger immédiatement vers la page de login
   * - Empêcher l'accès à la page protégée
   */


  if (!token) {
    return <Navigate to="/login" />
  }
   /**
   * Si le token existe (utilisateur connecté) :
   * - Afficher le composant enfant (la page demandée)
   */

  return children
}

export default ProtectedRoute