import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmploiTempsPage from './pages/EmploiTempsPage'
import CahierTexte from './pages/CahierTexte'
import VacationsPage from './pages/VacationsPage'
import PointageQRPage from './pages/PointageQRPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/emploi-temps" element={
            <ProtectedRoute><EmploiTempsPage /></ProtectedRoute>
          } />
          <Route path="/cahiers" element={
            <ProtectedRoute><CahierTexte /></ProtectedRoute>
          } />
          <Route path="/vacations" element={
            <ProtectedRoute><VacationsPage /></ProtectedRoute>
          } />
          <Route path="/pointage-qr" element={
            <ProtectedRoute><PointageQRPage /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App