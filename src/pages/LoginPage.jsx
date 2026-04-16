function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', width: '400px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#0d6efd' }}>EduSchedule Pro</h2>
        <h5 style={{ textAlign: 'center', color: 'gray' }}>Connexion</h5>

        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input type="email" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }} placeholder="votre@email.com" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Mot de passe</label>
          <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '5px' }} placeholder="••••••••" />
        </div>

        <button style={{ width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Se connecter
        </button>
      </div>
    </div>
  )
}

export default LoginPage