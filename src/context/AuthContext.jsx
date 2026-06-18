import { createContext, useState, useContext, useEffect } from 'react'

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
  const [user, setUser] = useState(null)   
  const [token, setToken] = useState(localStorage.getItem('token') || null) 
  const [role, setRole] = useState(localStorage.getItem('role') || null)  

  // Charger les données au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    const savedRole = localStorage.getItem('role')
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

   /**
   * Fonction login - Connecte un utilisateur
   * 
   * Sauvegarde les infos de l'utilisateur et les persiste dans localStorage
   * pour que la session reste active même après un rafraîchissement de page.
   */
  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    setRole(userData.role)
    
    localStorage.setItem('token', tokenData)
    localStorage.setItem('role', userData.role)
    localStorage.setItem('user', JSON.stringify(userData)) 
  }

  /**
   * Fonction logout - Déconnecte l'utilisateur
   * 
   * Efface tous les données d'authentification de l'état React
   * et supprime les données du localStorage
   */
  const logout = () => { 
    setUser(null)
    setToken(null)
    setRole(null)
    
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
  }

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
 */
export function useAuth() {
  return useContext(AuthContext)
}