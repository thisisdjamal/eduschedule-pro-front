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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/emploi-temps" element={
            <EmploiTempsPage />
          } />
          <Route path="/cahiers" element={<CahierTexte/>
          } />
          <Route path="/vacations" element={
            <VacationsPage />
          } />
          <Route path="/pointage-qr" element={
            <PointageQRPage />
          } />
          <Route path="/gestion" element={<GestionPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App