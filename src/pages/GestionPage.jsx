import DashboardLayout from '../components/DashboardLayout'
import './GestionPage.css'
import { useState } from 'react'

function GestionPage() {
  const [activeTab, setActiveTab] = useState('salles')

  // SALLES
  const [salles, setSalles] = useState([
    { id: 1, code: 'S101', libelle: 'Salle 101', capacite: 50, equipements: 'Tableau blanc, Projecteur' },
    { id: 2, code: 'S102', libelle: 'Salle 102', capacite: 40, equipements: 'Tableau blanc' },
  ])
  const [showSalleForm, setShowSalleForm] = useState(false)
  const [salleFormData, setSalleFormData] = useState({ code: '', libelle: '', capacite: '', equipements: '' })

  const handleOpenSalleForm = () => {
    setSalleFormData({ code: '', libelle: '', capacite: '', equipements: '' })
    setShowSalleForm(true)
  }
  const handleCloseSalleForm = () => setShowSalleForm(false)
  const handleSaveSalle = () => {
    if (!salleFormData.code || !salleFormData.libelle) {
      alert('Veuillez remplir tous les champs')
      return
    }
    const newSalle = {
      ...salleFormData,
      id: Math.max(...salles.map(s => s.id)) + 1,
      capacite: parseInt(salleFormData.capacite)
    }
    setSalles([...salles, newSalle])
    alert(' Salle ajoutée')
    handleCloseSalleForm()
  }
  const handleDeleteSalle = (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      setSalles(salles.filter(s => s.id !== id))
      alert(' Salle supprimée')
    }
  }

  // MATIERES
  const [matieres, setMatieres] = useState([
    { id: 1, code: 'DW', libelle: 'Développement Web', volumeHoraire: 60 },
    { id: 2, code: 'MATH', libelle: 'Mathématiques', volumeHoraire: 80 },
  ])
  const [showMatiereForm, setShowMatiereForm] = useState(false)
  const [matiereFormData, setMatiereFormData] = useState({ code: '', libelle: '', volumeHoraire: '' })

  const handleOpenMatiereForm = () => {
    setMatiereFormData({ code: '', libelle: '', volumeHoraire: '' })
    setShowMatiereForm(true)
  }
  const handleCloseMatiereForm = () => setShowMatiereForm(false)
  const handleSaveMatiere = () => {
    if (!matiereFormData.code || !matiereFormData.libelle) {
      alert('Veuillez remplir tous les champs')
      return
    }
    const newMatiere = {
      ...matiereFormData,
      id: Math.max(...matieres.map(m => m.id)) + 1,
      volumeHoraire: parseInt(matiereFormData.volumeHoraire)
    }
    setMatieres([...matieres, newMatiere])
    alert(' Matière ajoutée')
    handleCloseMatiereForm()
  }
  const handleDeleteMatiere = (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      setMatieres(matieres.filter(m => m.id !== id))
      alert(' Matière supprimée')
    }
  }

  //  ENSEIGNANTS 
  const [enseignants, setEnseignants] = useState([
    { id: 1, nom: 'BERE', prenom: 'Cédric', email: 'bere@itrst.com', specialite: 'Développement Web' },
    { id: 2, nom: 'SANOGO', prenom: 'Mohamed', email: 'sanogo@itrst.com', specialite: 'Mathématiques' },
  ])
  const [showEnseignantForm, setShowEnseignantForm] = useState(false)
  const [enseignantFormData, setEnseignantFormData] = useState({ nom: '', prenom: '', email: '', specialite: '' })

  const handleOpenEnseignantForm = () => {
    setEnseignantFormData({ nom: '', prenom: '', email: '', specialite: '' })
    setShowEnseignantForm(true)
  }
  const handleCloseEnseignantForm = () => setShowEnseignantForm(false)
  const handleSaveEnseignant = () => {
    if (!enseignantFormData.nom || !enseignantFormData.prenom || !enseignantFormData.email) {
      alert('Veuillez remplir tous les champs')
      return
    }
    const newEnseignant = {
      ...enseignantFormData,
      id: Math.max(...enseignants.map(e => e.id)) + 1
    }
    setEnseignants([...enseignants, newEnseignant])
    alert(' Enseignant ajouté')
    handleCloseEnseignantForm()
  }
  const handleDeleteEnseignant = (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      setEnseignants(enseignants.filter(e => e.id !== id))
      alert(' Enseignant supprimé')
    }
  }

  //  DELEGUES 
  const [delegues, setDelegues] = useState([
    { id: 1, nom: 'TRAORE', prenom: 'Fatoumata', email: 'traore@student.com', classe: 'Licence 1' },
    { id: 2, nom: 'DIALLO', prenom: 'Ibrahim', email: 'diallo@student.com', classe: 'Licence 2' },
  ])
  const [showDelegueForm, setShowDelegueForm] = useState(false)
  const [delegueFormData, setDelegueFormData] = useState({ nom: '', prenom: '', email: '', classe: 'Licence 1' })

  const handleOpenDelegueForm = () => {
    setDelegueFormData({ nom: '', prenom: '', email: '', classe: 'Licence 1' })
    setShowDelegueForm(true)
  }
  const handleCloseDelegueForm = () => setShowDelegueForm(false)
  const handleSaveDeligue = () => {
    if (!delegueFormData.nom || !delegueFormData.prenom || !delegueFormData.email) {
      alert('Veuillez remplir tous les champs')
      return
    }
    const newDeligue = {
      ...delegueFormData,
      id: Math.max(...delegues.map(d => d.id)) + 1
    }
    setDelegues([...delegues, newDeligue])
    alert(' Délégué ajouté')
    handleCloseDelegueForm()
  }
  const handleDeleteDeligue = (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      setDelegues(delegues.filter(d => d.id !== id))
      alert(' Délégué supprimé')
    }
  }

  return (
    <DashboardLayout>
      <h2> Gestion</h2>

      {/* TABS */}
      <div className="gestion-tabs">
        <button className={`tab-btn ${activeTab === 'salles' ? 'active' : ''}`} onClick={() => setActiveTab('salles')}>
           Salles
        </button>
        <button className={`tab-btn ${activeTab === 'matieres' ? 'active' : ''}`} onClick={() => setActiveTab('matieres')}>
           Matières
        </button>
        <button className={`tab-btn ${activeTab === 'enseignants' ? 'active' : ''}`} onClick={() => setActiveTab('enseignants')}>
           Enseignants
        </button>
        <button className={`tab-btn ${activeTab === 'delegues' ? 'active' : ''}`} onClick={() => setActiveTab('delegues')}>
           Délégués
        </button>
      </div>

      {/* CONTENU DES TABS */}
      <div className="gestion-content">

        {/* ===== SALLES ===== */}
        {activeTab === 'salles' && (
          <div className="tab-content">
            <h3>Gestion des Salles</h3>
            <button className="btn-add" onClick={handleOpenSalleForm}>➕ Ajouter une salle</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Capacité</th>
                  <th>Équipements</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salles.map(salle => (
                  <tr key={salle.id}>
                    <td>{salle.code}</td>
                    <td>{salle.libelle}</td>
                    <td>{salle.capacite}</td>
                    <td>{salle.equipements}</td>
                    <td className="actions">
                    
                      <button className="btn-delete" onClick={() => handleDeleteSalle(salle.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMULAIRE SALLE */}
        {showSalleForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>➕ Nouvelle salle</h3>
              <div className="form-group">
                <label>Code *</label>
                <input type="text" value={salleFormData.code} onChange={(e) => setSalleFormData({ ...salleFormData, code: e.target.value })} placeholder="Ex: S101" />
              </div>
              <div className="form-group">
                <label>Libellé *</label>
                <input type="text" value={salleFormData.libelle} onChange={(e) => setSalleFormData({ ...salleFormData, libelle: e.target.value })} placeholder="Ex: Salle 101" />
              </div>
              <div className="form-group">
                <label>Capacité *</label>
                <input type="number" value={salleFormData.capacite} onChange={(e) => setSalleFormData({ ...salleFormData, capacite: e.target.value })} placeholder="Ex: 50" />
              </div>
              <div className="form-group">
                <label>Équipements</label>
                <input type="text" value={salleFormData.equipements} onChange={(e) => setSalleFormData({ ...salleFormData, equipements: e.target.value })} placeholder="Ex: Tableau blanc, Projecteur" />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveSalle}> Créer</button>
                <button className="btn-cancel" onClick={handleCloseSalleForm}> Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/*  MATIERES*/}
        {activeTab === 'matieres' && (
          <div className="tab-content">
            <h3>Gestion des Matières</h3>
            <button className="btn-add" onClick={handleOpenMatiereForm}>➕ Ajouter une matière</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Volume Horaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matieres.map(matiere => (
                  <tr key={matiere.id}>
                    <td>{matiere.code}</td>
                    <td>{matiere.libelle}</td>
                    <td>{matiere.volumeHoraire}h</td>
                    <td className="actions">
                     
                      <button className="btn-delete" onClick={() => handleDeleteMatiere(matiere.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMULAIRE MATIERE */}
        {showMatiereForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>➕ Nouvelle matière</h3>
              <div className="form-group">
                <label>Code *</label>
                <input type="text" value={matiereFormData.code} onChange={(e) => setMatiereFormData({ ...matiereFormData, code: e.target.value })} placeholder="Ex: DW" />
              </div>
              <div className="form-group">
                <label>Libellé *</label>
                <input type="text" value={matiereFormData.libelle} onChange={(e) => setMatiereFormData({ ...matiereFormData, libelle: e.target.value })} placeholder="Ex: Développement Web" />
              </div>
              <div className="form-group">
                <label>Volume Horaire *</label>
                <input type="number" value={matiereFormData.volumeHoraire} onChange={(e) => setMatiereFormData({ ...matiereFormData, volumeHoraire: e.target.value })} placeholder="Ex: 60" />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveMatiere}> Créer</button>
                <button className="btn-cancel" onClick={handleCloseMatiereForm}> Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ENSEIGNANTS */}
        {activeTab === 'enseignants' && (
          <div className="tab-content">
            <h3>Gestion des Enseignants</h3>
            <button className="btn-add" onClick={handleOpenEnseignantForm}>➕ Ajouter un enseignant</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enseignants.map(ens => (
                  <tr key={ens.id}>
                    <td>{ens.nom}</td>
                    <td>{ens.prenom}</td>
                    <td>{ens.email}</td>
                    <td>{ens.specialite}</td>
                    <td className="actions">
                      
                      <button className="btn-delete" onClick={() => handleDeleteEnseignant(ens.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMULAIRE ENSEIGNANT */}
        {showEnseignantForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>➕ Nouvel enseignant</h3>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={enseignantFormData.nom} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, nom: e.target.value })} placeholder="Ex: BERE" />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input type="text" value={enseignantFormData.prenom} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, prenom: e.target.value })} placeholder="Ex: Cédric" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={enseignantFormData.email} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, email: e.target.value })} placeholder="Ex: bere@itrst.com" />
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <input type="text" value={enseignantFormData.specialite} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, specialite: e.target.value })} placeholder="Ex: Développement Web" />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveEnseignant}> Créer</button>
                <button className="btn-cancel" onClick={handleCloseEnseignantForm}> Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* DELEGUES */}
        {activeTab === 'delegues' && (
          <div className="tab-content">
            <h3>Gestion des Délégués</h3>
            <button className="btn-add" onClick={handleOpenDelegueForm}>➕ Ajouter un délégué</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Classe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {delegues.map(del => (
                  <tr key={del.id}>
                    <td>{del.nom}</td>
                    <td>{del.prenom}</td>
                    <td>{del.email}</td>
                    <td>{del.classe}</td>
                    <td className="actions">
                      
                      <button className="btn-delete" onClick={() => handleDeleteDelegue(del.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FORMULAIRE DELEGUE */}
        {showDelegueForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>➕ Nouveau délégué</h3>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={delegueFormData.nom} onChange={(e) => setDelegueFormData({ ...delegueFormData, nom: e.target.value })} placeholder="Ex: TRAORE" />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input type="text" value={delegueFormData.prenom} onChange={(e) => setDelegueFormData({ ...delegueFormData, prenom: e.target.value })} placeholder="Ex: Fatoumata" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={delegueFormData.email} onChange={(e) => setDelegueFormData({ ...delegueFormData, email: e.target.value })} placeholder="Ex: traore@student.com" />
              </div>
              <div className="form-group">
                <label>Classe *</label>
                <select value={delegueFormData.classe} onChange={(e) => setDelegueFormData({ ...delegueFormData, classe: e.target.value })}>
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveDeligue}> Créer</button>
                <button className="btn-cancel" onClick={handleCloseDelegueForm}> Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}

export default GestionPage