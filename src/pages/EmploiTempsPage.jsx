import DashboardLayout from '../components/DashboardLayout'

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const heures = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function EmploiTempsPage() {
  return (
    <DashboardLayout>
      <h2>Emploi du Temps</h2>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <select style={{ padding: '8px', borderRadius: '5px', border: '1px solid #f52985' }}>
          <option>Toutes les classes</option>
          <option>Licence 1</option>
          <option>Licence 2</option>
          <option>Licence 3</option>
          <option>Master 1</option>
        </select>
        <input type="week" style={{ padding: '8px', borderRadius: '5px', border: '1px solid #f52985' }} />
        <button style={{ padding: '8px 20px', backgroundColor: '#6d421a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Filtrer
        </button>
      </div>

      {/* GRILLE */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#6d421a', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'center' }}>Heure</th>
              {jours.map(jour => (
                <th key={jour} style={{ padding: '12px', textAlign: 'center' }}>{jour}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heures.map((heure, index) => (
              <tr key={heure} style={{ backgroundColor: index % 2 === 0 ? '#eddee6' : 'white' }}>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#6d421a', borderRight: '2px solid #f49dea' }}>
                  {heure}
                </td>
                {jours.map(jour => (
                  <td key={jour} style={{ padding: '8px', textAlign: 'center', border: '1px solid #edaed4', minWidth: '120px', minHeight: '60px' }}>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

export default EmploiTempsPage