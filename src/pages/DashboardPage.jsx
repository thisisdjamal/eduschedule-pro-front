import DashboardLayout from '../components/DashboardLayout'

function DashboardPage() {
  return (
    <DashboardLayout>
      <h2>Tableau de bord</h2>
      <p>Bienvenue sur EduSchedule Pro !</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #0d6efd' }}>
          <h6 style={{ color: 'gray' }}>Séances aujourd'hui</h6>
          <h2 style={{ color: '#0d6efd' }}>0</h2>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #28a745' }}>
          <h6 style={{ color: 'gray' }}>Cahiers signés</h6>
          <h2 style={{ color: '#28a745' }}>0</h2>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #ffc107' }}>
          <h6 style={{ color: 'gray' }}>Alertes</h6>
          <h2 style={{ color: '#ffc107' }}>0</h2>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default DashboardPage