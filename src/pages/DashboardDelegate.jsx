import DashboardLayout from '../components/DashboardLayout'
import './DashboardDelegate.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

function DashboardDelegate() {
  const { user, token } = useAuth()

  const [mesCahiers, setMesCahiers] = useState([])
  const [emploiTemps, setEmploiTemps] = useState([])

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // Charge les cahiers de texte du délégué connecté à travers son id
  useEffect(() => {
    if (!token) return

    const fetchCahiers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/Cahiers.php`, { headers })
        const json = await res.json()
        if (!json.success) return

        setMesCahiers(
          json.data.map(c => ({
            id: c.id,
            matiere: c.matiere,
            enseignant: `${c.enseignant_nom} ${c.enseignant_prenom}`,
            date: c.date_creation,
            statut: c.statut
          }))
        )
      } catch (err) {
        console.error('Erreur cahiers', err)
      }
    }

    fetchCahiers()
  }, [token])

  // Charge l'emploi du temps de la classe du délégué
  // On ajoute statut_publication=publie car le délégué ne doit voir
  // que les emplois publiés par l'admin
  useEffect(() => {
    if (!user?.classe_id || !token) return

    const fetchEmploi = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/Emploie_du_temps.php?id_classe=${user.classe_id}`
        const res = await fetch(url, { headers })
        const json = await res.json()
        if (!json.success) return

        // L'API retourne une liste d'emplois du temps pour la classe.
        // On ne garde que les publiés, puis on prend le plus récent.
        const publies = (json.data || []).filter(et => et.statut_publication === 'publie')
        if (publies.length === 0) {
          setEmploiTemps([])
          return
        }

        // Charge les créneaux de l'emploi du temps le plus récent
        const dernierEmploi = publies[0]
        const resDetail = await fetch(
          `${import.meta.env.VITE_API_URL}/Emploie_du_temps.php?id=${dernierEmploi.id}`,
          { headers }
        )
        const detail = await resDetail.json()
        if (!detail.success) return

        const creneaux = detail.data.creneaux ?? []
        setEmploiTemps(
          creneaux.map(c => ({
            id: c.id,
            jour: c.jour,
            heure: c.heure_debut.substring(0, 5),
            matiere: c.matiere_libelle,
            enseignant: `${c.enseignant_nom} ${c.enseignant_prenom}`
          }))
        )
      } catch (err) {
        console.error('Erreur emploi du temps', err)
      }
    }

    fetchEmploi()
  }, [token, user?.classe_id])

  return (
    <DashboardLayout>
      <h2>Tableau de Bord Délégué</h2>

      <div className="delegate-grid">

        {/* Emploi du temps — uniquement les emplois publiés */}
        <div className="card">
          <h4>Emploi du Temps de Ma Classe</h4>
          <div className="emploi-list">
            {emploiTemps.length === 0 ? (
              <p>Aucun emploi du temps publié pour cette classe.</p>
            ) : (
              emploiTemps.map((cours, idx) => (
                <div key={idx} className="cours-item">
                  <div>
                    <p className="jour">{cours.jour}</p>
                    <p className="matiere">{cours.matiere}</p>
                    <p className="details">{cours.heure} - {cours.enseignant}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cahiers de texte du délégué */}
        <div className="card">
          <h4>Cahiers de Texte</h4>
          <div className="cahiers-list">
            {mesCahiers.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>Aucun cahier enregistré.</p>
            ) : mesCahiers.map(cahier => (
              <div key={cahier.id} className="cahier-item">
                <div>
                  <p className="matiere-cahier">{cahier.matiere}</p>
                  <p className="info">{cahier.enseignant} - {cahier.date}</p>
                </div>
                <span className={`badge badge-${cahier.statut.toLowerCase().replace(' ', '-')}`}>
                  {cahier.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Statistiques calculées depuis les données API */}
      <div className="card">
        <h4>Mon Activité</h4>
        <div className="activity-grid">
          <div className="activity-box">
            <label>Total Cahiers</label>
            <p className="big">{mesCahiers.length}</p>
          </div>
          <div className="activity-box">
            <label>En Attente</label>
            <p className="big text-warning">
              {mesCahiers.filter(c => c.statut === 'brouillon').length}
            </p>
          </div>
          <div className="activity-box">
            <label>Clôturés</label>
            <p className="big text-success">
              {mesCahiers.filter(c => c.statut === 'cloture').length}
            </p>
          </div>
          <div className="activity-box">
            <label>Classe</label>
            <p className="big">{user?.classe_libelle || 'Non définie'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardDelegate
