import { createContext, useState, useContext } from 'react'

// ============================================================================
// CONTEXTE D'AUTHENTIFICATION (AuthContext)
// ============================================================================
// Ce fichier gère l'authentification globale de l'application :
// - Stockage de l'utilisateur connecté
// - Gestion du token JWT
// - Gestion du rôle utilisateur (admin, enseignant, délégué, étudiant)
// - Persistance des données via localStorage
// ============================================================================

/**
 * Crée le contexte d'authentification
 * Ce contexte sera utilisé par toute l'application pour accéder aux données d'auth
 */

const AuthContext = createContext()
/**
 * AuthProvider - Fournisseur d'authentification
 * 
 * Ce composant enveloppe toute l'application et fournit les données d'authentification
 * à tous les composants enfants via le contexte.
 * 
 * @param {Object} children - Les composants enfants qui auront accès au contexte
 */

export function AuthProvider({ children }) 

{
  const [user, setUser] = useState(null)   // État utilisateur : stocke les infos de l'utilisateur connecté (null si pas connecté)
  const [token, setToken] = useState(localStorage.getItem('token') || null) // État token : stocke le JWT reçu du serveur backend
  // On récupère du localStorage s'il existe déjà (pour persister la session)
  const [role, setRole] = useState(localStorage.getItem('role') || 'admin')  // État rôle : stocke le rôle de l'utilisateur
  // Valeurs possibles : 'admin', 'enseignant', 'delegate', 'etudiant'

   /**
   * Fonction login - Connecte un utilisateur
   * 
   * Sauvegarde les infos de l'utilisateur et les persiste dans localStorage
   * pour que la session reste active même après un rafraîchissement de page.
   * 
   * @param {Object} userData - Les données de l'utilisateur (ex: {id: 1, nom: 'Jean'})
   * @param {string} tokenData - Le JWT reçu du serveur backend
   * @param {string} roleData - Le rôle de l'utilisateur (défaut: 'admin')
   */
  const login = (userData, tokenData, roleData = 'admin') => {
    setUser(userData)
    setToken(tokenData)
    setRole(roleData)
    localStorage.setItem('token', tokenData)   // Met à jour les états React setUser(userData) setToken(tokenData)  setRole(roleData)
    
    // Sauvegarde dans localStorage pour persister la session
    // (ainsi l'utilisateur reste connecté après un rafraîchissement)
    localStorage.setItem('role', roleData)
  }
/**
   * Fonction logout - Déconnecte l'utilisateur
   * 
   * Efface tous les données d'authentification de l'état React
   * et supprime les données du localStorage
   */
  const logout = () => { //Reinitialise les etats à null
    setUser(null)
    setToken(null)
    setRole(null)
    //Supprime les données du localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }
//Fournit les données et fonctions d'authentification à tous les composants enfants
  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
/**
 * Hook useAuth - Accède au contexte d'authentification
 * 
 * À utiliser dans n'importe quel composant pour accéder aux données d'auth :
 * const { user, token, role, login, logout } = useAuth()
 * 
 * @returns {Object} L'objet du contexte contenant user, token, role, login, logout
 */
export function useAuth() {
  return useContext(AuthContext)
}