import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmploiTempsPage from './pages/EmploiTempsPage'
import CahierTexte from './pages/CahierTexte'
import VacationsPage from './pages/VacationsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/emploi-temps" element={<EmploiTempsPage />} />
          <Route path="/cahiers" element={<CahierTexte />} />
          <Route path="/vacations" element={<VacationsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App