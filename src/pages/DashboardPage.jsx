import DashboardLayout from '../components/DashboardLayout'

function DashboardPage() {
  return (
    <DashboardLayout>
      <h2>Tableau de bord</h2>
      <p>Bienvenue sur EduSchedule Pro !</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #dd0dfdeb' }}>
          <h6 style={{ color: 'gray' }}>Séances aujourd'hui</h6>
          <h2 style={{ color: '#0e0904d3' }}>0</h2>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #cf1968' }}>
          <h6 style={{ color: 'gray' }}>Cahiers signés</h6>
          <h2 style={{ color: '#030300e1' }}>0</h2>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderLeft: '5px solid #ff076a' }}>
          <h6 style={{ color: 'gray' }}>Alertes</h6>
          <h2 style={{ color: '#0c0901d4' }}>0</h2>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default DashboardPage