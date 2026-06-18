import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmploiTempsPage from './pages/EmploiTempsPage'
import CahierTexte from './pages/CahierTexte'
import VacationsPage from './pages/VacationsPage'
import PointageQRPage from './pages/PointageQRPage'
import GestionPage from './pages/GestionPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/*on utilise les routes pour naviguer entre les pages de l'application, chaque route est protégée par le composant ProtectedRoute qui vérifie le rôle de l'utilisateur avant d'afficher la page correspondante.*/} 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin", "enseignant", "delegue", "surveillant", "comptable"]}><DashboardPage /></ProtectedRoute>} />
          
          <Route path="/emploi-temps" element={<ProtectedRoute allowedRoles={["admin", "enseignant", "delegue", "comptable", "etudiant", "surveillant"]}><EmploiTempsPage /></ProtectedRoute>} />

          <Route path="/cahiers" element={<ProtectedRoute allowedRoles={["admin", "enseignant", "delegue", "surveillant"]}><CahierTexte/></ProtectedRoute>} />

          <Route path="/vacations" element={<ProtectedRoute allowedRoles={["admin", "enseignant", "comptable", "surveillant"]}><VacationsPage /></ProtectedRoute>} />

          <Route path="/pointage-qr" element={<ProtectedRoute allowedRoles={["admin", "enseignant"]}><PointageQRPage /></ProtectedRoute>} />

          <Route path="/gestion" element={<ProtectedRoute allowedRoles={["admin"]}><GestionPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App