import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

function LoginPage() {// États locaux pour les champs du formulaire et les messages d'erreur
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {// Réinitialise les erreurs avant de tenter la connexion
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/Login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()

      if (response.ok) {
        login(data.user, data.token)
        console.log('rôle reçu :', data.user.role, '| type :', typeof data.user.role)
        if (data.user.role === 'surveillant' || data.user.role === 'comptable') {
          navigate('/vacations')
        } else if (data.user.role === 'etudiant') {
          navigate('/emploi-temps')
        } else if (data.user.role === 'delegue' || data.user.role === 'enseignant' || data.user.role === 'admin') {
          navigate('/dashboard')
        }
      } else {
          setError(data.message || 'Email ou mot de passe incorrect')
        }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    }
  }

  // Permet de soumettre le formulaire en appuyant sur la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (// Affiche le formulaire de connexion avec des champs pour l'email et le mot de passe, ainsi qu'un bouton de soumission. Les erreurs sont affichées en cas de problème de connexion.
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">EduSchedule Pro</h2>
        <h5 className="login-subtitle">Connexion</h5>

        {error && <div className="login-error">{error}</div>}

          {/* Champ d'email avec type "email" pour une validation de base, et gestion de l'événement onKeyDown pour permettre la soumission avec la touche Entrée. */}
        <div className="login-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="votre@email.com"
          />
        </div>

        {/* Champ de mot de passe avec type "password" pour masquer la saisie, et gestion de l'événement onKeyDown pour permettre la soumission avec la touche Entrée. */}
        <div className="login-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
          />
        </div>

        {/* Bouton de connexion qui déclenche la fonction handleSubmit lors du clic. */}
        <button className="login-btn" onClick={handleSubmit}>
          Se connecter
        </button>
      </div>
    </div>
  )
}

export default LoginPage
