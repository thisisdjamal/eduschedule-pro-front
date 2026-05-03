import DashboardLayout from '../components/DashboardLayout'
import './EmploiTempsPage.css'
import { useState } from 'react'
import {useAuth} from '../context/AuthContext'

function EmploiTempsPage() {
  const{role}= useAuth()
  const [classes] = useState(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'])
  const [selectedClass, setSelectedClass] = useState('Licence 1')
  const [selectedWeek, setSelectedWeek] = useState('2025-04-27')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    matiere: '',
    salle: '',
    enseignant: '',
    jour: 'Lundi',
    debut: '07:00',
    fin: '09:00',
  })
  
  const [emploiTemps, setEmploiTemps] = useState({
    'Licence 1': [
      { id: 1, matiere: 'Développement Web', salle: 'Salle 101', enseignant: 'Dr BERE', jour: 'Lundi', debut: '07:00', fin: '09:00', publie: true },
      { id: 2, matiere: 'Mathématiques', salle: 'Salle 102', enseignant: 'M. SANOGO', jour: 'Mardi', debut: '08:00', fin: '11:00', publie: true },
      { id: 3, matiere: 'Programmation C++', salle: 'Salle 101', enseignant: 'M. SANOGO', jour: 'Jeudi', debut: '14:00', fin: '17:00', publie: true },
      { id: 12, matiere: 'Algorithme', salle: 'Salle 102', enseignant: 'Dr BERE', jour: 'Mercredi', debut: '10:00', fin: '12:00', publie: false },
    ],
    'Licence 2': [
      { id: 4, matiere: 'Physique', salle: 'Labo Info', enseignant: 'Dr BERE', jour: 'Mercredi', debut: '08:00', fin: '12:00', publie: false },
      { id: 5, matiere: 'Algorithme Avancé', salle: 'Salle 103', enseignant: 'M. SANOGO', jour: 'Lundi', debut: '10:00', fin: '12:00', publie: true },
    ],
    'Licence 3': [
      { id: 6, matiere: 'Sécurité Réseaux', salle: 'Salle 103', enseignant: 'Dr BERE', jour: 'Vendredi', debut: '09:00', fin: '12:00', publie: true },
      { id: 7, matiere: 'Base de Données', salle: 'Salle 104', enseignant: 'M. SANOGO', jour: 'Mercredi', debut: '14:00', fin: '16:00', publie: true },
    ],
    'Master 1': [
      { id: 8, matiere: 'Intelligence Artificielle', salle: 'Salle 105', enseignant: 'Dr BERE', jour: 'Mardi', debut: '09:00', fin: '12:00', publie: true },
      { id: 9, matiere: 'Cloud Computing', salle: 'Labo Info', enseignant: 'M. SANOGO', jour: 'Jeudi', debut: '10:00', fin: '13:00', publie: false },
    ],
    'Master 2': [
      { id: 10, matiere: 'Cybersécurité', salle: 'Salle 106', enseignant: 'Dr BERE', jour: 'Lundi', debut: '14:00', fin: '17:00', publie: true },
      { id: 11, matiere: 'Blockchain', salle: 'Salle 107', enseignant: 'M. SANOGO', jour: 'Vendredi', debut: '10:00', fin: '13:00', publie: true },
    ]
  })

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const heures = ['07:00 à 09h30', '10:00 à 12:30', '15:00 à 18:00']
  const currentSeances = emploiTemps[selectedClass] || []

  const getWeekLabel = (dateStr) => {
    const date = new Date(dateStr)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 6)
    return `${date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} au ${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}`
  }

  const handleOpenForm = (seance = null) => {
    if (seance) {
      setFormData({ ...seance })
      setEditingId(seance.id)
    } else {
      setFormData({
        matiere: '',
        salle: '',
        enseignant: '',
        jour: 'Lundi',
        debut: '07:00',
        fin: '09:00',
      })
      setEditingId(null)
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSaveSeance = () => {
    if (!formData.matiere || !formData.salle || !formData.enseignant) {
      alert('Veuillez remplir tous les champs')
      return
    }

    if (editingId) {
      // Modifier
      setEmploiTemps({
        ...emploiTemps,
        [selectedClass]: emploiTemps[selectedClass].map(e =>
          e.id === editingId ? { ...formData, id: editingId, publie: false } : e
        )
      })
      alert('✅ Séance modifiée')
    } else {
      // Créer
      const newSeance = {
        ...formData,
        id: Math.max(...Object.values(emploiTemps).flat().map(e => e.id)) + 1,
        publie: false
      }
      setEmploiTemps({
        ...emploiTemps,
        [selectedClass]: [...emploiTemps[selectedClass], newSeance]
      })
      alert('✅ Séance créée')
    }
    handleCloseForm()
  }

  const handlePublish = (id) => {
    setEmploiTemps({
      ...emploiTemps,
      [selectedClass]: emploiTemps[selectedClass].map(e =>
        e.id === id ? { ...e, publie: true } : e
      )
    })
  }

  const handleUnpublish = (id) => {
    setEmploiTemps({
      ...emploiTemps,
      [selectedClass]: emploiTemps[selectedClass].map(e =>
        e.id === id ? { ...e, publie: false } : e
      )
    })
  }

  const handleDuplicate = (id) => {
    const seance = currentSeances.find(e => e.id === id)
    const newSeance = {
      ...seance,
      id: Math.max(...Object.values(emploiTemps).flat().map(e => e.id)) + 1,
      publie: false
    }
    setEmploiTemps({
      ...emploiTemps,
      [selectedClass]: [...emploiTemps[selectedClass], newSeance]
    })
    alert('✅ Séance dupliquée')
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette séance ?')) {
      setEmploiTemps({
        ...emploiTemps,
        [selectedClass]: emploiTemps[selectedClass].filter(e => e.id !== id)
      })
    }
  }
  const handlePublishEmploiTemps = (classe) => {
  setEmploiTemps({
    ...emploiTemps,
    [classe]: emploiTemps[classe].map(e => ({ ...e, publie: true }))
  })
  alert('✅ Emploi du temps publié pour ' + classe)
}

const handleUnpublishEmploiTemps = (classe) => {
  setEmploiTemps({
    ...emploiTemps,
    [classe]: emploiTemps[classe].map(e => ({ ...e, publie: false }))
  })
  alert('✅ Emploi du temps dépublié pour ' + classe)
}

const handleDuplicateEmploiTemps = (classe) => {
  const seancesDupliquees = emploiTemps[classe].map(seance => ({
    ...seance,
    id: Math.max(...Object.values(emploiTemps).flat().map(e => e.id)) + 1,
    publie: false
  }))
  setEmploiTemps({
    ...emploiTemps,
    [classe]: [...emploiTemps[classe], ...seancesDupliquees]
  })
  alert('✅ Emploi du temps dupliqué vers la semaine suivante')
}

  const getSeanceAt = (jour, heure) => {
    const heureDebut = heure.split(' ')[0]
    return currentSeances.find(s => s.jour === jour && s.debut === heureDebut)
  }

  return (
    <DashboardLayout>
      <h2>Emploi du Temps</h2>

      {/* SÉLECTEUR DE CLASSE */}
      <div className="class-selector">
        <h4>Sélectionner une classe :</h4>
        <div className="classes-grid">
          {classes.map(classe => (
            <button
              key={classe}
              className={`class-btn ${selectedClass === classe ? 'active' : ''}`}
              onClick={() => setSelectedClass(classe)}
            >
              {classe}
            </button>
          ))}
        </div>
      </div>

      {/* SÉLECTEUR DE SEMAINE */}
      <div className="week-selector">
        <h4>Sélectionner une semaine :</h4>
        <input 
          type="date" 
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="date-input"
        />
        <span className="week-label">{getWeekLabel(selectedWeek)}</span>
        {role === 'admin' && (
        <button className="btn-add-seance" onClick={() => handleOpenForm()}>
          ➕ Ajouter une séance
        </button>
        )}
      </div>

      {/* ACTIONS EMPLOI DU TEMPS */}
       {role === 'admin' && (
<div className="emploi-actions">
  <h4>Actions sur l'emploi du temps</h4>
  <div className="actions-buttons">
   
    <button className="btn-action-emploi btn-publish-emploi" onClick={() => handlePublishEmploiTemps(selectedClass)}>
       Publier l'emploi du temps
    </button>
    
       
    <button className="btn-action-emploi btn-unpublish-emploi" onClick={() => handleUnpublishEmploiTemps(selectedClass)}>
       Dépublier l'emploi du temps
    </button>
    <button className="btn-action-emploi btn-duplicate-emploi" onClick={() => handleDuplicateEmploiTemps(selectedClass)}>
      Dupliquer vers semaine suivante
    </button>
      
    
  </div>
  
</div>
       )}


      {/* FORMULAIRE */}
      { role === 'admin' && showForm && (
        <div className="form-modal">
          <div className="form-container">
            <h3>{editingId ? 'Modifier la séance' : '➕ Nouvelle séance'}</h3>
            
            <div className="form-group">
              <label>Matière *</label>
              <input
                type="text"
                value={formData.matiere}
                onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                placeholder="Ex: Développement Web"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Salle *</label>
                <input
                  type="text"
                  value={formData.salle}
                  onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                  placeholder="Ex: Salle 101"
                />
              </div>

              <div className="form-group">
                <label>Enseignant *</label>
                <input
                  type="text"
                  value={formData.enseignant}
                  onChange={(e) => setFormData({ ...formData, enseignant: e.target.value })}
                  placeholder="Ex: Dr BERE"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Jour *</label>
                <select
                  value={formData.jour}
                  onChange={(e) => setFormData({ ...formData, jour: e.target.value })}
                >
                  {jours.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Début *</label>
                <input
                  type="time"
                  value={formData.debut}
                  onChange={(e) => setFormData({ ...formData, debut: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fin *</label>
                <input
                  type="time"
                  value={formData.fin}
                  onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-save" onClick={handleSaveSeance}>
                {editingId ? '💾 Modifier' : '✅ Créer'}
              </button>
              <button className="btn-cancel" onClick={handleCloseForm}>
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDRIER/GRILLE */}
      <div className="calendar-container">
        <div className="calendar-header">
          <h3>{selectedClass}</h3>
          <p>Semaine du {getWeekLabel(selectedWeek)}</p>
        </div>

        <div className="calendar-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-header">Horaire</th>
                {jours.map(jour => (
                  <th key={jour} className="day-header">{jour}</th>
                ))}
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
                            <div className="course-time">[{seance.debut}-{seance.fin}]</div>
                            <div className="course-matiere">{seance.matiere}</div>
                            <div className="course-enseignant">{seance.enseignant}</div>
                            <div className="course-salle">{seance.salle}</div>
                            { role === 'admin' && (
                              <div className="course-actions">
                              <button className="action-btn edit" onClick={() => handleOpenForm(seance)} title="Modifier">✏️</button>
                              {seance.publie ? (
                                <button className="action-btn unpublish" onClick={() => handleUnpublish(seance.id)} title="Dépublier">🔒</button>
                              ) : (
                                <button className="action-btn publish" onClick={() => handlePublish(seance.id)} title="Publier">🔓</button>
                              )}
                              <button className="action-btn duplicate" onClick={() => handleDuplicate(seance.id)} title="Dupliquer">📋</button>
                              <button className="action-btn delete" onClick={() => handleDelete(seance.id)} title="Supprimer">🗑️</button>
                            </div>
                            )}

                            

                            <span className={`course-status ${seance.publie ? 'publiee' : 'brouillon'}`}>
                              {seance.publie ? '✅' : '📝'}
                            </span>
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

      {/* STATISTIQUES */}
      <div className="stats-section">
        <h4>📊 Statistiques - {selectedClass}</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <label>Total Séances</label>
            <p className="big">{currentSeances.length}</p>
          </div>
          <div className="stat-card">
            <label>Publiées</label>
            <p className="big">{currentSeances.filter(e => e.publie).length}</p>
          </div>
          <div className="stat-card">
            <label>Brouillon</label>
            <p className="big">{currentSeances.filter(e => !e.publie).length}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EmploiTempsPage