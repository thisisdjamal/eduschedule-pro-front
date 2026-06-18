import DashboardLayout from '../components/DashboardLayout'
import './EmploiTempsPage.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// URL de base construite depuis la variable d'environnement VITE_API_URL, évite de faire plusieurs fois import.meta.env.VITE_API_URL dans le code
const API_BASE = import.meta.env.VITE_API_URL
const API_EMPLOI = `${API_BASE}/Emploie_du_temps.php`
const API_CRENEAUX = `${API_BASE}/Creneaux.php`
const API_CLASSES = `${API_BASE}/Classes.php`
const API_USERS = `${API_BASE}/Utilisateurs.php`

function EmploiTempsPage() {
  const { user, token } = useAuth() // Récupère le token d'authentification et les infos utilisateur depuis le contexte pour les requêtes API et la logique de rôle

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // Jours et heures fixes pour la grille de l'emploi du temps
  const jours  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const heures = ['07:30 à 09:30', '10:00 à 12:30', '15:00 à 18:00']

  // ── États ──────────────────────────────────────────────────
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [emploiTempsId, setEmploiTempsId] = useState(null)
  const [emploiTemps, setEmploiTemps] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError]  = useState(null)
  const [showForm, setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff)).toISOString().split('T')[0]
  })

  // Formulaire de créneau (admin)
  const [formData, setFormData] = useState({
    id_matiere: '', id_salle: '', id_enseignant: '',
    jour: 'Lundi', heure_debut: '07:00', heure_fin: '09:00',
  })

  const currentSeances = emploiTemps[selectedClass?.id] || []
  const canEdit = user?.role === 'admin'

  // ── Chargement initial selon le rôle ──────────────────────
  // Admin → charge toutes les classes
  // Délégué → récupère son id_lien (= id de sa classe) puis charge cette classe uniquement
  useEffect(() => {
    if (!token) return

    const init = async () => {
      try {
        if (user?.role === 'admin') {
          // Admin : charge la liste complète des classes
          const res = await fetch(API_CLASSES, { headers })
          const json = await res.json()
          if (json.success && json.data?.length > 0) {
            setClasses(json.data)
            setSelectedClass(json.data[0])
          }

        } else if (user?.role === 'delegue') {
          // Délégué : son id_lien dans utilisateurs pointe directement vers classes.id
          // On récupère son profil pour lire id_lien, puis on charge cette classe
          const res = await fetch(`${API_USERS}?id=${user.id}`, { headers })
          const json = await res.json()

          if (json.success && json.data?.id_lien) {
            // Charge le détail de la classe liée au délégué
            const resC  = await fetch(`${API_CLASSES}?id=${json.data.id_lien}`, { headers })
            const jsonC = await resC.json()

            if (jsonC.success && jsonC.data) {
              // Le délégué ne voit qu'une seule classe — la sienne
              setClasses([jsonC.data])
              setSelectedClass(jsonC.data)
            }
          } else {
            setError("Aucune classe associée à votre compte. Contactez l'administrateur.")
          }
        }
      } catch (err) {
        setError('Erreur chargement initial : ' + err.message)
      }
    }

    init()
  }, [token, user?.role, user?.id])

  // ── Chargement de l'emploi du temps ───────────────────────
  // Se déclenche à chaque changement de classe ou de semaine
  useEffect(() => {
    if (!token || !selectedClass) return

    const fetchEmploiTemps = async () => {
      setLoading(true)
      setError(null)

      try {
        // GET ?id_classe=X&semaine=YYYY-MM-DD
        const url = `${API_EMPLOI}?id_classe=${selectedClass.id}&semaine=${selectedWeek}`
        const response = await fetch(url, { headers })
        const result = await response.json()

        if (result.success && result.data) {
          const etData = Array.isArray(result.data) ? result.data[0] : result.data

          if (etData) {
            setEmploiTempsId(etData.id)

            // Charge le détail complet avec les créneaux enrichis
            const res2 = await fetch(`${API_EMPLOI}?id=${etData.id}`, { headers })
            const result2 = await res2.json()

            if (result2.success && result2.data?.creneaux) {
              setEmploiTemps(prev => ({
                ...prev,
                [selectedClass.id]: result2.data.creneaux.map(c => ({
                  id: c.id,
                  matiere: c.matiere_libelle || 'Matière inconnue',
                  salle: c.salle_code || 'Salle N/A',
                  enseignant: `${c.enseignant_nom || ''} ${c.enseignant_prenom || ''}`.trim() || 'Non assigné',
                  jour: c.jour,
                  debut: c.heure_debut ? c.heure_debut.substring(0, 5) : '00:00',
                  fin: c.heure_fin ? c.heure_fin.substring(0, 5)   : '00:00',
                  publie: result2.data.statut_publication === 'publie',
                  id_matiere: c.id_matiere,
                  id_enseignant: c.id_enseignant,
                  id_salle: c.id_salle,
                }))
              }))
            }
          } else {
            // Aucun planning pour cette classe/semaine
            setEmploiTempsId(null)
            setEmploiTemps(prev => ({ ...prev, [selectedClass.id]: [] }))
          }
        } else {
          // L'API a répondu success:false ou data vide
          setEmploiTempsId(null)
          setEmploiTemps(prev => ({ ...prev, [selectedClass.id]: [] }))
        }
      } catch (err) {
        setError('Erreur de connexion au serveur')
      } finally {
        setLoading(false)
      }
    }

    fetchEmploiTemps()
  }, [token, selectedClass, selectedWeek])

  // ── Utilitaires ───────────────────────────────────────────
  const getWeekLabel = (dateStr) => {// Formate une date de début de semaine en "DD MMMM au DD MMMM"
    const date = new Date(dateStr), end = new Date(dateStr)
    end.setDate(end.getDate() + 6)
    return `${date.toLocaleDateString('fr-FR', { day:'2-digit', month:'long' })} au ${end.toLocaleDateString('fr-FR', { day:'2-digit', month:'long' })}`
  }

  const getSeanceAt = (jour, heureLabel) => {// Trouve la séance correspondant à ce jour et cette plage horaire
    const [debut] = heureLabel.split(' à ')
    return currentSeances.find(s => s.jour === jour && s.debut.startsWith(debut))
  }

  // ── Formulaire créneau ────────────────────────────────────
  const handleOpenForm = (seance = null) => {
    if (seance) {
      setFormData({ id_matiere: seance.id_matiere, id_salle: seance.id_salle,
        id_enseignant: seance.id_enseignant, jour: seance.jour,
        heure_debut: seance.debut, heure_fin: seance.fin })
      setEditingId(seance.id)
    } else {
      setFormData({ id_matiere:'', id_salle:'', id_enseignant:'',
        jour:'Lundi', heure_debut:'07:30', heure_fin:'09:30' })
      setEditingId(null)
    }
    setShowForm(true)
  }

  const handleCloseForm = () => { setShowForm(false); setEditingId(null) }// Ferme le formulaire et réinitialise l'état d'édition

  const handleSaveSeance = async () => {
    if (!formData.id_matiere || !formData.id_enseignant || !formData.id_salle) {
      alert('Veuillez remplir tous les champs obligatoires'); return
    }

    let currentEtId = emploiTempsId

    // Crée l'emploi du temps parent si inexistant pour cette semaine
    if (!currentEtId && !editingId) {
      try {
        const res = await fetch(API_EMPLOI, { method:'POST', headers,
          body: JSON.stringify({ id_classe: selectedClass.id, semaine_debut: selectedWeek }) })
        const json = await res.json()
        if (!json.success) { alert('Erreur création planning : ' + json.message); return }
        currentEtId = json.id
        setEmploiTempsId(json.id)
      } catch (err) { alert('Erreur réseau : ' + err.message); return }
    }

    try {
      const res = editingId
        ? await fetch(`${API_CRENEAUX}?id=${editingId}`, { method:'PUT', headers, body: JSON.stringify(formData) })
        : await fetch(API_CRENEAUX, { method:'POST', headers, body: JSON.stringify({
            ...formData, id_emploi_temps: currentEtId,
            heure_debut: formData.heure_debut + ':00',
            heure_fin: formData.heure_fin + ':00',
          }) })

      const json = await res.json()

      if (!json.success) {// Si l'API retourne une erreur, affiche un message. En cas de conflit (409), détaille les conflits détectés.
        if (res.status === 409) {
          const details = json.conflits?.map(c =>
            `→ Conflit ${c.type_conflit} : ${c.matiere} le ${c.jour} ${c.heure_debut?.slice(0,5)}–${c.heure_fin?.slice(0,5)}`
          ).join('\n')
          alert(`Conflit détecté :\n${details || json.message}`)
        } else { alert('Erreur : ' + json.message) }
        return
      }

      // Force le rechargement en touchant selectedClass
      setEmploiTemps(prev => ({ ...prev, [selectedClass.id]: [] }))
      setSelectedClass({ ...selectedClass })
      handleCloseForm()
      alert(editingId ? '✅ Créneau modifié' : '✅ Créneau créé')
    } catch (err) { alert('Erreur réseau : ' + err.message) }
  }

  // ── Actions emploi du temps ───────────────────────────────
  const handlePublishEmploiTemps = async () => {
    if (!emploiTempsId) { alert('Aucun emploi du temps pour cette semaine'); return }
    try {
      const res = await fetch(`${API_EMPLOI}?id=${emploiTempsId}&action=publier`, { method:'PUT', headers })
      const json = await res.json()
      if (json.success) {
        setEmploiTemps(prev => ({ ...prev,
          [selectedClass.id]: (prev[selectedClass.id]||[]).map(s => ({...s, publie:true})) }))
        alert('✅ Emploi du temps publié')
      } else { alert('Erreur : ' + json.message) }
    } catch (err) { alert('Erreur réseau : ' + err.message) }
  }

  const handleUnpublishEmploiTemps = async () => {// Dépublie l'emploi du temps en cours, passe tous les créneaux en brouillon
    if (!emploiTempsId) { alert('Aucun emploi du temps pour cette semaine'); return }
    try {
      const res = await fetch(`${API_EMPLOI}?id=${emploiTempsId}&action=depublier`, { method:'PUT', headers })
      const json = await res.json()
      if (json.success) {
        setEmploiTemps(prev => ({ ...prev,
          [selectedClass.id]: (prev[selectedClass.id]||[]).map(s => ({...s, publie:false})) }))
        alert('✅ Emploi du temps dépublié')
      } else { alert('Erreur : ' + json.message) }
    } catch (err) { alert('Erreur réseau : ' + err.message) }
  }

  const handleDuplicateEmploiTemps = async () => {// Duplique l'emploi du temps de la semaine sélectionnée vers la semaine suivante
    if (!emploiTempsId || currentSeances.length === 0) {
      alert('Aucune séance à dupliquer'); return
    }
    const suivante = new Date(selectedWeek)
    suivante.setDate(suivante.getDate() + 7)
    const suivanteStr = suivante.toISOString().split('T')[0]

    try {// Crée un nouvel emploi du temps pour la semaine suivante, puis duplique tous les créneaux de la semaine actuelle vers ce nouvel emploi du temps
      const resEt = await fetch(API_EMPLOI, { method:'POST', headers,
        body: JSON.stringify({ id_classe: selectedClass.id, semaine_debut: suivanteStr }) })
      const jsonEt = await resEt.json()
      if (!jsonEt.success && resEt.status !== 409) {
        alert('Erreur : ' + jsonEt.message); return
      }
      let ok = 0
      for (const s of currentSeances) {
        const r = await fetch(API_CRENEAUX, { method:'POST', headers, body: JSON.stringify({
          id_emploi_temps: jsonEt.id, id_matiere: s.id_matiere,
          id_enseignant: s.id_enseignant, id_salle: s.id_salle,
          jour: s.jour, heure_debut: s.debut+':00', heure_fin: s.fin+':00',
        }) })
        if ((await r.json()).success) ok++
      }
      alert(`✅ ${ok}/${currentSeances.length} séances copiées vers ${getWeekLabel(suivanteStr)}`)
    } catch (err) { alert('Erreur réseau : ' + err.message) }
  }

  const handleDelete = async (id) => {// Supprime un créneau après confirmation de l'utilisateur, puis force le rechargement de l'emploi du temps
    if (!window.confirm('Supprimer ce créneau ? Action irréversible.')) return
    try {
      const res = await fetch(`${API_CRENEAUX}?id=${id}`, { method:'DELETE', headers })
      const json = await res.json()
      if (json.success) {
        setEmploiTemps(prev => ({ ...prev,
          [selectedClass.id]: (prev[selectedClass.id]||[]).filter(s => s.id !== id) }))
        alert('✅ Créneau supprimé')
      } else { alert('Erreur : ' + json.message) }
    } catch (err) { alert('Erreur réseau : ' + err.message) }
  }

  // Handlers pour les boutons d'action (publier, dépublier, dupliquer) et pour l'ouverture du formulaire de modification/création de créneau
  const handlePublish   = () => window.confirm('Publier tous les créneaux ?')   && handlePublishEmploiTemps()
  const handleUnpublish = () => window.confirm('Dépublier tous les créneaux ?') && handleUnpublishEmploiTemps()
  const handleDuplicate = (id) => {
    const s = currentSeances.find(s => s.id === id)
    if (s) handleOpenForm({ ...s, id: null })
  }

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <h2>
        {/* Titre adapté au rôle : le délégué voit "Mon emploi du temps", l'admin "Gestion" */}
        {user?.role === 'delegue' ? 'Mon Emploi du Temps' : "Gestion de l'Emploi du Temps"}
      </h2>

      {/* ── SÉLECTEUR DE CLASSE ──
          Admin : boutons pour naviguer entre toutes les classes
          Délégué : un seul bouton (sa classe), non cliquable car déjà sélectionné */}
      <div className="class-selector">
        <h4>{user?.role === 'delegue' ? 'Ma classe :' : 'Sélectionner un niveau :'}</h4>
        <div className="classes-grid">
          {classes.map(classe => (
            <button
              key={classe.id}
              className={`class-btn ${selectedClass?.id === classe.id ? 'active' : ''}`}
              // Le délégué ne peut pas changer de classe — onClick désactivé
              onClick={() => canEdit && setSelectedClass(classe)}
              style={user?.role === 'delegue' ? { cursor: 'default' } : {}}
            >
              {classe.niveau}
            </button>
          ))}
        </div>
      </div>

      {/* ── SÉLECTEUR DE SEMAINE ── */}
      <div className="week-selector">
        <h4>Semaine :</h4>
        <input type="date" value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)} className="date-input" />
        <span className="week-label">{getWeekLabel(selectedWeek)}</span>
        {canEdit && (
          <button className="btn-add-seance" onClick={() => handleOpenForm()}>
            ➕ Ajouter une séance
          </button>
        )}
      </div>

      {loading && <p>Chargement de l'emploi du temps...</p>}
      {error   && <p style={{ color:'red' }}>{error}</p>}

      {/* ── ACTIONS ADMIN UNIQUEMENT ── */}
      {canEdit && (
        <div className="emploi-actions">
          <h4>Actions sur l'emploi du temps</h4>
          <div className="actions-buttons">
            <button className="btn-action-emploi btn-publish-emploi"   onClick={handlePublishEmploiTemps}>Publier</button>
            <button className="btn-action-emploi btn-unpublish-emploi" onClick={handleUnpublishEmploiTemps}>Dépublier</button>
            <button className="btn-action-emploi btn-duplicate-emploi" onClick={handleDuplicateEmploiTemps}>Dupliquer → semaine suivante</button>
          </div>
        </div>
      )}

      {/* ── FORMULAIRE CRÉNEAU (admin) ── */}
      {canEdit && showForm && (
        <div className="form-modal">
          <div className="form-container">
            <h3>{editingId ? 'Modifier la séance' : '➕ Nouvelle séance'}</h3>
            <div className="form-group">
              <label>ID Matière *</label>
              <input type="number" value={formData.id_matiere} placeholder="Ex: 3"
                onChange={(e) => setFormData({...formData, id_matiere: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ID Salle *</label>
                <input type="number" value={formData.id_salle} placeholder="Ex: 2"
                  onChange={(e) => setFormData({...formData, id_salle: e.target.value})} />
              </div>
              <div className="form-group">
                <label>ID Enseignant *</label>
                <input type="number" value={formData.id_enseignant} placeholder="Ex: 5"
                  onChange={(e) => setFormData({...formData, id_enseignant: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jour *</label>
                <select value={formData.jour} onChange={(e) => setFormData({...formData, jour: e.target.value})}>
                  {jours.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Début *</label>
                <input type="time" value={formData.heure_debut}
                  onChange={(e) => setFormData({...formData, heure_debut: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Fin *</label>
                <input type="time" value={formData.heure_fin}
                  onChange={(e) => setFormData({...formData, heure_fin: e.target.value})} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save"   onClick={handleSaveSeance}>{editingId ? '✏️ Modifier' : '✅ Créer'}</button>
              <button className="btn-cancel" onClick={handleCloseForm}>❌ Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE si aucune séance pour cette semaine ── */}
      {!loading && currentSeances.length === 0 && selectedClass && (
        <p style={{ color:'#888', marginBottom:'12px' }}>
          Aucun cours planifié pour {selectedClass.niveau} — semaine du {getWeekLabel(selectedWeek)}.
          {/* Le délégué voit ce message s'il n'y a pas de planning publié */}
          {user?.role === 'delegue' && " L'emploi du temps n'a pas encore été publié."}
        </p>
      )}

      {/* ── GRILLE ── */}
      <div className="calendar-container">
        <div className="calendar-header">
          <h3>{selectedClass?.niveau || 'Aucune classe sélectionnée'}</h3>
          <p>Semaine du {getWeekLabel(selectedWeek)}</p>
        </div>
        <div className="calendar-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-header">Horaire</th>
                {jours.map(j => <th key={j} className="day-header">{j}</th>)}
              </tr>
            </thead>
            <tbody>
              {heures.map((heure, idx) => (
                <tr key={idx} className="time-row">
                  <td className="time-cell">{heure}</td>
                  {jours.map(jour => {
                    const seance = getSeanceAt(jour, heure)
                    return (
                      <td key={`${jour}-${heure}`} className="course-cell">
                        {seance && (
                          <div className={`course-block ${seance.publie ? 'publiee' : 'brouillon'}`}>
                            <div className="course-time">[{seance.debut}–{seance.fin}]</div>
                            <div className="course-matiere">{seance.matiere}</div>
                            <div className="course-enseignant">{seance.enseignant}</div>
                            <div className="course-salle">{seance.salle}</div>
                            {/* Boutons d'action visibles uniquement pour l'admin */}
                            {canEdit && (
                              <div className="course-actions">
                                <button className="action-btn edit"
                                  onClick={() => handleOpenForm(seance)} title="Modifier">✏️</button>
                                {seance.publie
                                  ? <button className="action-btn unpublish" onClick={() => handleUnpublish(seance.id)} title="Dépublier">🔒</button>
                                  : <button className="action-btn publish"   onClick={() => handlePublish(seance.id)}   title="Publier">🔓</button>
                                }
                                <button className="action-btn duplicate"
                                  onClick={() => handleDuplicate(seance.id)} title="Dupliquer">📋</button>
                                <button className="action-btn delete"
                                  onClick={() => handleDelete(seance.id)} title="Supprimer">🗑️</button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STATISTIQUES ── */}
      <div className="stats-section">
        <h4>Statistiques — {selectedClass?.niveau}</h4>
        <div className="stats-grid">
          <div className="stat-card"><label>Total Séances</label><p className="big">{currentSeances.length}</p></div>
          <div className="stat-card"><label>Publiées</label><p className="big">{currentSeances.filter(s => s.publie).length}</p></div>
          <div className="stat-card"><label>Brouillon</label><p className="big">{currentSeances.filter(s => !s.publie).length}</p></div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EmploiTempsPage