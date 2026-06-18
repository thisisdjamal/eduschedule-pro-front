import DashboardLayout from '../components/DashboardLayout'
import './GestionPage.css'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// URL de base construite depuis la variable d'environnement VITE_API_URL, évite de faire plusieurs fois import.meta.env.VITE_API_URL dans le code
const API_BASE = import.meta.env.VITE_API_URL

function GestionPage() {
  const { token } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL
  
  const [activeTab, setActiveTab] = useState('salles')
  const [loading, setLoading] = useState(false)

  // ETATS POUR LES DONNEES
  const [salles, setSalles] = useState([])
  const [matieres, setMatieres] = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [delegues, setDelegues] = useState([])
  const [classesList, setClassesList] = useState([]) // Pour le menu déroulant des délégués
  const [etudiants, setEtudiants] = useState([]) // pour pouvoir ajouter des étudiants dans le système

  // FETCH DES DONNÉES SELON L'ONGLET ACTIF
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true)
      try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

        if (activeTab === 'salles') {
          const res = await fetch(`${API_BASE}/Salles.php`, { headers })
          const data = await res.json()
          // Met à jour la liste des salles uniquement si la requête a réussi
          if (data.success) setSalles(data.data)
        } 
        
        else if (activeTab === 'matieres') {// Si l'onglet actif est "matières", récupère la liste des matières depuis l'API et met à jour l'état matieres
          const res = await fetch(`${API_BASE}/Matieres.php`, { headers })
          const data = await res.json()
          if(data.success) setMatieres(data.data)
        } 
        
        else if (activeTab === 'enseignants') {// Si l'onglet actif est "enseignants", récupère la liste des enseignants depuis l'API et met à jour l'état enseignants
          const res = await fetch(`${API_BASE}/Enseignants.php`, { headers })
          const data = await res.json()
          if(data.success) setEnseignants(data.data)
        } 
        
        else if (activeTab === 'delegues') {
          // Récupérer les délégués
          const resDel = await fetch(`${API_BASE}/Utilisateurs.php?role=delegue`, { headers })
          const dataDel = await resDel.json()
          if(dataDel.success) setDelegues(dataDel.data)
          
          // Récupérer les classes pour le select du formulaire
          const resClass = await fetch(`${API_BASE}/Classes.php`, { headers })
          const dataClass = await resClass.json()
          if(dataClass.success) setClassesList(dataClass.data)
        }

         else if (activeTab === 'etudiants') {
          // Récupérer les étudiants
          const resEtud = await fetch(`${API_BASE}/Utilisateurs.php?role=etudiant`, { headers })
          const dataEtud = await resEtud.json()
          if(dataEtud.success) setEtudiants(dataEtud.data)
    
          // Récupérer les classes pour le select du formulaire
          const resClass = await fetch(`${API_BASE}/Classes.php`, { headers })
          const dataClass = await resClass.json()
          if(dataClass.success) setClassesList(dataClass.data)
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, token, API_URL])

  // GESTION DES SALLES
  const [showSalleForm, setShowSalleForm] = useState(false)
  const [salleFormData, setSalleFormData] = useState({ code: '', capacite: '', equipements: '', batiment: '', disponible:''})

  const handleOpenSalleForm = () => { setSalleFormData({ code: '', capacite: '', equipements: '', batiment: '', disponible:'', created_at: '' }); setShowSalleForm(true) }
  const handleCloseSalleForm = () => setShowSalleForm(false)
  
  const handleSaveSalle = async () => {
    if (!salleFormData.code || !salleFormData.capacite || !salleFormData.equipements || !salleFormData.batiment || salleFormData.disponible === '') {
      alert('Veuillez remplir tous les champs')
      return
    }
    try {// Envoie une requête POST à l'API pour créer une nouvelle salle avec les données du formulaire, puis met à jour la liste des salles affichées et ferme le formulaire si la création a réussi
      const res = await fetch(`${API_BASE}/Salles.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          code: salleFormData.code,
          libelle: salleFormData.libelle,
          capacite: parseInt(salleFormData.capacite),
          equipements: salleFormData.equipements.split(',').map(e => e.trim()) // Convertit la chaîne en tableau d'équipements
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('Salle ajoutée avec succès')
        setSalles([...salles, { ...salleFormData, id: result.id }])
        handleCloseSalleForm()
      } else {
        alert(result.message || 'Erreur lors de l\'ajout')
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteSalle = async (id) => {// Supprime une salle après confirmation de l'utilisateur, puis met à jour la liste des salles affichées si la suppression a réussi
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      try {
        const res = await fetch(`${API_BASE}/Salles.php?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setSalles(salles.filter(s => s.id !== id))
          alert('Salle supprimée')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  const handleModifSalles = async (id) => {// Modifie une salle après confirmation de l'utilisateur, puis met à jour la liste des salles affichées si la modification a réussi
    if (window.confirm('Vous êtes sur le point de modifier cette salle ?')) {
      try {
        const res = await fetch(`${API_BASE}/Salles.php?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(salleFormData)
        })
        const result = await res.json()
        if (result.success) {
          setSalles(salles.filter(s => s.id !== id))
          alert('Salle modifiée')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }
  // GESTION DES MATIERES
  const [showMatiereForm, setShowMatiereForm] = useState(false)

  const [matiereFormData, setMatiereFormData] = useState({ code: '', libelle: '', volume: '', coefficient: '1' })

  const handleOpenMatiereForm = () => { setMatiereFormData({ code: '', libelle: '', volume: '', coefficient: '1' }); setShowMatiereForm(true) }
  const handleCloseMatiereForm = () => setShowMatiereForm(false)
  
  const handleSaveMatiere = async () => {// Envoie une requête POST à l'API pour créer une nouvelle matière avec les données du formulaire, puis met à jour la liste des matières affichées et ferme le formulaire si la création a réussi
    if (!matiereFormData.code || !matiereFormData.libelle || !matiereFormData.volume || !matiereFormData.coefficient) {
      alert('Veuillez remplir tous les champs')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/Matieres.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          code: matiereFormData.code,
          libelle: matiereFormData.libelle,
          volume: parseInt(matiereFormData.volume),
          coefficient: parseFloat(matiereFormData.coefficient)
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('Matière ajoutée avec succès')
        setMatieres([...matieres, { ...matiereFormData, id: result.id, volume_horaire_total: matiereFormData.volume }])
        handleCloseMatiereForm()
      } else {
        alert(result.message || 'Erreur lors de l\'ajout')
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteMatiere = async (id) => {// Supprime une matière après confirmation de l'utilisateur, puis met à jour la liste des matières affichées si la suppression a réussi
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      try {
        const res = await fetch(`${API_BASE}/Matieres.php?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setMatieres(matieres.filter(m => m.id !== id))
          alert('Matière supprimée')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  // GESTION DES ENSEIGNANTS
  const [showEnseignantForm, setShowEnseignantForm] = useState(false)
  // Ajout de matricule, statut et taux pour correspondre à l'API Enseignants.php
  const [enseignantFormData, setEnseignantFormData] = useState({ matricule: '', nom: '', prenom: '', email: '', specialite: '', statut: 'vacataire', taux: '0' })

  const handleOpenEnseignantForm = () => { setEnseignantFormData({ matricule: '', nom: '', prenom: '', email: '', specialite: '', statut: 'vacataire', taux: '0' }); setShowEnseignantForm(true) }
  const handleCloseEnseignantForm = () => setShowEnseignantForm(false)
  
  const handleSaveEnseignant = async () => {// Envoie une requête POST à l'API pour créer un nouvel enseignant avec les données du formulaire, puis met à jour la liste des enseignants affichés et ferme le formulaire si la création a réussi
    if (!enseignantFormData.matricule || !enseignantFormData.nom || !enseignantFormData.email) {
      alert('Veuillez remplir les champs obligatoires (Matricule, Nom, Email)')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/Enseignants.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...enseignantFormData,
          taux: parseFloat(enseignantFormData.taux)
        })
      })
      const result = await res.json()
      if (result.success) {
        alert(`Enseignant ajouté. Mdp par défaut: ${enseignantFormData.matricule}`)
        setEnseignants([...enseignants, { ...enseignantFormData, id: result.id }])
        handleCloseEnseignantForm()
      } else {
        alert(result.message)
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteEnseignant = async (id) => {// Supprime un enseignant après confirmation de l'utilisateur, puis met à jour la liste des enseignants affichés si la suppression a réussi
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        const res = await fetch(`${API_BASE}/Enseignants.php?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setEnseignants(enseignants.filter(e => e.id !== id))
          alert('Enseignant supprimé')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  // GESTION DES DELEGUES (Via Utilisateurs.php)
  const [showDelegueForm, setShowDelegueForm] = useState(false)
  // L'API Utilisateurs.php (cas 'delegue') exige de promouvoir un étudiant existant via son email + classe_id
  const [delegueFormData, setDelegueFormData] = useState({ email: '', classe_id: '' })

  const handleOpenDelegueForm = () => { 
    setDelegueFormData({ email: '', classe_id: classesList.length > 0 ? classesList[0].id : '' }); 
    setShowDelegueForm(true) 
  }
  const handleCloseDelegueForm = () => setShowDelegueForm(false)
  
  const handleSaveDelegue = async () => {// Envoie une requête POST à l'API pour promouvoir un étudiant en délégué avec les données du formulaire, puis met à jour la liste des délégués affichés et ferme le formulaire si la promotion a réussi
    if (!delegueFormData.email || !delegueFormData.classe_id) {
      alert('Veuillez fournir l\'email de l\'étudiant et choisir une classe')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/Utilisateurs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          role: 'delegue',
          email: delegueFormData.email,
          classe_id: parseInt(delegueFormData.classe_id),
          password: 'ignore' // Requis par la validation du backend même s'il promeut un existant
        })
      })
      const result = await res.json()
      if (result.success) {// Si la promotion a réussi, affiche une alerte de succès, rafraîchit la liste des délégués affichés et ferme le formulaire
        alert('Étudiant promu délégué avec succès')
        // On rafraîchit la liste
        const resDel = await fetch(`${API_BASE}/Utilisateurs.php?role=delegue`, { headers: { 'Authorization': `Bearer ${token}` } })
        const dataDel = await resDel.json()
        setDelegues(dataDel.data || [])
        handleCloseDelegueForm()
      } else {
        alert(result.message) // Ex: "Ce compte existe mais n'est pas un étudiant"
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteDelegue = async (id) => {// Supprime un délégué après confirmation de l'utilisateur, puis met à jour la liste des délégués affichés si la suppression a réussi
    if (window.confirm('Voulez-vous vraiment supprimer cet accès utilisateur ?')) {
      try {
        const res = await fetch(`${API_BASE}/Utilisateurs.php?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setDelegues(delegues.filter(d => d.id !== id))
          alert('Utilisateur supprimé')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  // GESTION DES ETUDIANTS (Via Utilisateurs.php)
  const [showEtudiantForm, setShowEtudiantForm] = useState(false)
  const [etudiantFormData, setEtudiantFormData] = useState({ email: '', classe_id: '' })

  const handleOpenEtudiantForm = () => { 
    setEtudiantFormData({ email: '', classe_id: classesList.length > 0 ? classesList[0].id : '' }); 
    setShowEtudiantForm(true) 
  }
  const handleCloseEtudiantForm = () => setShowEtudiantForm(false)
  
  const handleSaveEtudiant = async () => {// Envoie une requête POST à l'API pour créer un étudiant avec les données du formulaire, puis met à jour la liste des étudiants affichés et ferme le formulaire si la création a réussi
    if (!etudiantFormData.email || !etudiantFormData.classe_id) {
      alert('Veuillez fournir l\'email de l\'étudiant et choisir une classe')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/Utilisateurs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          role: 'etudiant',
          email: etudiantFormData.email,
          classe_id: parseInt(etudiantFormData.classe_id),
          password: 'ignore' // Requis par la validation du backend même s'il promeut un existant
        })
      })
      const result = await res.json()
      if (result.success) {// Si la création a réussi, affiche une alerte de succès, rafraîchit la liste des étudiants affichés et ferme le formulaire
        alert('Étudiant créé avec succès')
        // On rafraîchit la liste
        const resEtud = await fetch(`${API_BASE}/Utilisateurs.php?role=etudiant`, { headers: { 'Authorization': `Bearer ${token}` } })
        const dataEtud = await resEtud.json()
        setEtudiants(dataEtud.data || [])
        handleCloseEtudiantForm()
      } else {
        alert(result.message) // Ex: "Ce compte existe mais n'est pas un étudiant"
      }
    } catch (err) { console.error(err) }
  }

  const handleModifEtudiant = async (id) => {// Modifie un étudiant après confirmation de l'utilisateur, puis met à jour la liste des étudiants affichés si la modification a réussi
    if (window.confirm('Vous êtes sur le point de modifier cet étudiant ?')) {
      if (!etudiantFormData.email || !etudiantFormData.classe_id) {
        alert('Veuillez fournir l\'email de l\'étudiant et choisir une classe')
        return
      }
      try {
        const res = await fetch(`${API_BASE}/Utilisateurs.php?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(etudiantFormData)
        })
        const result = await res.json()
        if (result.success) {
          setEtudiants(etudiants.filter(e => e.id !== id))
          alert('Étudiant modifié')
        // On rafraîchit la liste
          const resEtud = await fetch(`${API_BASE}/Utilisateurs.php?role=etudiant`, { headers: { 'Authorization': `Bearer ${token}` } })
          const dataEtud = await resEtud.json()
          setEtudiants(dataEtud.data || [])
          handleCloseEtudiantForm()
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteEtudiant = async (id) => {// Supprime un étudiant après confirmation de l'utilisateur, puis met à jour la liste des étudiants affichés si la suppression a réussi
    if (window.confirm('Voulez-vous vraiment supprimer cet accès utilisateur ?')) {
      try {
        const res = await fetch(`${API_BASE}/Utilisateurs.php?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setEtudiants(etudiants.filter(e => e.id !== id))
          alert('Utilisateur supprimé')
        } else {
          alert(result.message)
        }
      } catch (err) { console.error(err) }
    }
  }

  return (
    <DashboardLayout>
      <h2>⚙️ Gestion</h2>

      {/* TABS */}
      <div className="gestion-tabs">
        <button className={`tab-btn ${activeTab === 'salles' ? 'active' : ''}`} onClick={() => setActiveTab('salles')}>Salles</button>
        <button className={`tab-btn ${activeTab === 'matieres' ? 'active' : ''}`} onClick={() => setActiveTab('matieres')}>Matières</button>
        <button className={`tab-btn ${activeTab === 'enseignants' ? 'active' : ''}`} onClick={() => setActiveTab('enseignants')}>Enseignants</button>
        <button className={`tab-btn ${activeTab === 'delegues' ? 'active' : ''}`} onClick={() => setActiveTab('delegues')}>Délégués</button>
        <button className={`tab-btn ${activeTab === 'etudiants' ? 'active' : ''}`} onClick={() => setActiveTab('etudiants')}>Étudiants</button>
      </div>

      {loading && <p>Chargement des données...</p>}

      <div className="gestion-content">

        {/* ===== SALLES ===== */}
        {activeTab === 'salles' && (// Si l'onglet actif est "salles", affiche la section de gestion des salles avec un tableau listant les salles et des boutons pour ajouter, modifier ou supprimer une salle
          <div className="tab-content">
            <h3>Gestion des Salles</h3>
            <button className="btn-add" onClick={handleOpenSalleForm}>Ajouter une salle</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Capacité</th>
                  <th>Équipements</th>
                  <th>Bâtiment</th>
                  <th>Disponible</th>
                  <th>Créé le</th>
                  <th className='actions'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salles.map(salle => (
                  <tr key={salle.id}>
                    <td>{salle.code}</td>
                    <td>{salle.capacite}</td>
                    <td>{salle.equipements}</td>
                    <td>{salle.batiment}</td>
                    <td>{salle.disponible ? 'Oui' : 'Non'}</td>
                    <td>{salle.created_at}</td>
                    <td className='actions'>
                      <button className="btn-delete" onClick={() => handleDeleteSalles(salle.id)}>🗑️ Supprimer</button>
                      <button className="btn-modify" onClick={() => handleModifSalles(salle.id)}>✏️ Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showSalleForm && (// Si showSalleForm est vrai, affiche un formulaire modal pour créer une nouvelle salle avec des champs pour le code, la capacité, les équipements, le bâtiment et la disponibilité, ainsi que des boutons pour enregistrer ou annuler
          <div className="form-modal">
            <div className="form-container">
              <h3>Nouvelle salle</h3>
              <div className="form-group">
                <label>Code *</label>
                <input 
                  type="text" 
                  value={salleFormData.code} 
                  onChange={(e) => setSalleFormData({ ...salleFormData, code: e.target.value })} 
                  placeholder="Ex: Salle 101" 
                />
              </div>
              <div className="form-group">
                <label>Bâtiment *</label>
                <input 
                  type="text" 
                  value={salleFormData.batiment} 
                  onChange={(e) => setSalleFormData({ ...salleFormData, batiment: e.target.value })} 
                  placeholder="Ex: Bloc A" 
                />
              </div>
              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                <div className="form-group">
                  <label>Capacité *</label>
                  <input 
                    type="number" 
                    value={salleFormData.capacite} 
                    onChange={(e) => setSalleFormData({ ...salleFormData, capacite: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Disponible *</label>
                  <select 
                    value={salleFormData.disponible} 
                    onChange={(e) => setSalleFormData({ ...salleFormData, disponible: e.target.value })}
                  >
                    <option value="">Choisir...</option>
                    <option value="1">Oui</option>
                    <option value="0">Non</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Équipements (séparés par des virgules)</label>
                <input 
                  type="text" 
                  value={salleFormData.equipements} 
                  onChange={(e) => setSalleFormData({ ...salleFormData, equipements: e.target.value })} 
                  placeholder="Ex: Projecteur, Tableau blanc" 
                />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveSalle}>Créer</button>
                <button className="btn-cancel" onClick={handleCloseSalleForm}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MATIERES ===== */}
        {activeTab === 'matieres' && (// Si l'onglet actif est "matières", affiche la section de gestion des matières avec un tableau listant les matières et des boutons pour ajouter ou supprimer une matière, ainsi qu'un formulaire modal pour créer une nouvelle matière avec des champs pour le code, le libellé, le volume horaire et le coefficient, ainsi que des boutons pour enregistrer ou annuler
          <div className="tab-content">
            <h3>Gestion des Matières</h3>
            <button className="btn-add" onClick={handleOpenMatiereForm}>➕ Ajouter une matière</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Volume Horaire</th>
                  <th>Coeff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matieres.map(matiere => (
                  <tr key={matiere.id}>
                    <td>{matiere.code}</td>
                    <td>{matiere.libelle}</td>
                    <td>{matiere.volume_horaire_total || matiere.volume}h</td>
                    <td>{matiere.coefficient}</td>
                    <td className="actions">
                      <button className="btn-delete" onClick={() => handleDeleteMatiere(matiere.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showMatiereForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>Nouvelle matière</h3>
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
                <input type="number" value={matiereFormData.volume} onChange={(e) => setMatiereFormData({ ...matiereFormData, volume: e.target.value })} placeholder="Ex: 60" />
              </div>
              <div className="form-group">
                <label>Coefficient *</label>
                <input type="number" step="0.5" value={matiereFormData.coefficient} onChange={(e) => setMatiereFormData({ ...matiereFormData, coefficient: e.target.value })} placeholder="Ex: 2.5" />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveMatiere}>Créer</button>
                <button className="btn-cancel" onClick={handleCloseMatiereForm}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== ENSEIGNANTS ===== */}
        {activeTab === 'enseignants' && (// Si l'onglet actif est "enseignants", affiche la section de gestion des enseignants avec un tableau listant les enseignants et des boutons pour ajouter ou supprimer un enseignant, ainsi qu'un formulaire modal pour créer un nouvel enseignant avec des champs pour le matricule, le nom, le prénom, l'email, la spécialité, le statut et le taux horaire, ainsi que des boutons pour enregistrer ou annuler
          <div className="tab-content">
            <h3>Gestion des Enseignants</h3>
            <button className="btn-add" onClick={handleOpenEnseignantForm}>➕ Ajouter un enseignant</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom & Prénom</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enseignants.map(ens => (
                  <tr key={ens.id}>
                    <td>{ens.matricule}</td>
                    <td>{ens.nom} {ens.prenom}</td>
                    <td>{ens.email}</td>
                    <td>{ens.specialite}</td>
                    <td>{ens.statut}</td>
                    <td className="actions">
                      <button className="btn-delete" onClick={() => handleDeleteEnseignant(ens.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showEnseignantForm && (// Si showEnseignantForm est vrai, affiche un formulaire modal pour créer un nouvel enseignant avec des champs pour le matricule, le nom, le prénom, l'email, la spécialité, le statut et le taux horaire, ainsi que des boutons pour enregistrer ou annuler
          <div className="form-modal">
            <div className="form-container">
              <h3>Nouvel enseignant</h3>
              
              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                <div className="form-group">
                    <label>Matricule *</label>
                    <input type="text" value={enseignantFormData.matricule} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, matricule: e.target.value })} placeholder="Ex: MAT123" />
                </div>
                <div className="form-group">
                    <label>Statut *</label>
                    <select value={enseignantFormData.statut} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, statut: e.target.value })}>
                      <option value="vacataire">Vacataire</option>
                      <option value="permanent">Permanent</option>
                    </select>
                </div>
              </div>

              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input type="text" value={enseignantFormData.nom} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, nom: e.target.value })} placeholder="Ex: BERE" />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input type="text" value={enseignantFormData.prenom} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, prenom: e.target.value })} placeholder="Ex: Cédric" />
                  </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={enseignantFormData.email} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, email: e.target.value })} placeholder="Ex: bere@itrst.com" />
              </div>

              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                  <div className="form-group">
                    <label>Spécialité</label>
                    <input type="text" value={enseignantFormData.specialite} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, specialite: e.target.value })} placeholder="Ex: Réseaux" />
                  </div>
                  <div className="form-group">
                    <label>Taux Horaire</label>
                    <input type="number" value={enseignantFormData.taux} onChange={(e) => setEnseignantFormData({ ...enseignantFormData, taux: e.target.value })} placeholder="Ex: 5000" />
                  </div>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveEnseignant}>Créer</button>
                <button className="btn-cancel" onClick={handleCloseEnseignantForm}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== DELEGUES ===== */}
        {activeTab === 'delegues' && (// Si l'onglet actif est "délégués", affiche la section de gestion des délégués avec un tableau listant les délégués et des boutons pour promouvoir un étudiant en délégué ou supprimer un délégué, ainsi qu'un formulaire modal pour promouvoir un étudiant en délégué avec des champs pour l'email de l'étudiant et la classe assignée, ainsi que des boutons pour enregistrer ou annuler
          <div className="tab-content">
            <h3>Gestion des Délégués</h3>
            <button className="btn-add" onClick={handleOpenDelegueForm}>➕ Promouvoir un étudiant</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>ID Compte</th>
                  <th>Email</th>
                  <th>ID Classe assignée</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {delegues.map(del => (
                  <tr key={del.id}>
                    <td>{del.id}</td>
                    <td>{del.email}</td>
                    <td>{del.id_lien}</td>
                    <td className="actions">
                      <button className="btn-delete" onClick={() => handleDeleteDelegue(del.id)}>Supprimer l'accès</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDelegueForm && (// Si showDelegueForm est vrai, affiche un formulaire modal pour promouvoir un étudiant en délégué avec des champs pour l'email de l'étudiant et la classe assignée, ainsi que des boutons pour enregistrer ou annuler
          <div className="form-modal">
            <div className="form-container">
              <h3>Promouvoir en délégué</h3>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
                Saisissez l'email d'un compte étudiant existant pour le promouvoir au rôle de délégué d'une classe.
              </p>
              
              <div className="form-group">
                <label>Email de l'étudiant *</label>
                <input type="email" value={delegueFormData.email} onChange={(e) => setDelegueFormData({ ...delegueFormData, email: e.target.value })} placeholder="Ex: etudiant@student.com" />
              </div>
              
              <div className="form-group">
                <label>Classe assignée *</label>
                <select value={delegueFormData.classe_id} onChange={(e) => setDelegueFormData({ ...delegueFormData, classe_id: e.target.value })}>
                  {classesList.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.niveau} - {classe.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveDelegue}>Promouvoir</button>
                <button className="btn-cancel" onClick={handleCloseDelegueForm}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Etudiant ===== */}
        {activeTab === 'etudiants' && (// Si l'onglet actif est "etudiants", affiche la section de gestion des étudiants avec un tableau listant les étudiants et des boutons pour ajouter, modifier ou supprimer un étudiant, ainsi qu'un formulaire modal pour créer ou modifier un étudiant avec des champs pour l'email de l'étudiant et la classe assignée, ainsi que des boutons pour enregistrer ou annuler
          <div className="tab-content">
            <h3>Gestion des Étudiants</h3>
            <button className="btn-add" onClick={handleOpenEtudiantForm}>Ajouter un étudiant</button>
            <table className="gestion-table">
              <thead>
                <tr>
                  <th>ID Compte</th>
                  <th>Email</th>
                  <th>Classe assignée</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {etudiants.map(etudiant => (
                  <tr key={etudiant.id}>
                    <td>{etudiant.id}</td>
                    <td>{etudiant.email}</td>
                    <td>{etudiant.classe_id}</td>
                    <td className="actions">
                      <button className="btn-delete" onClick={() => handleDeleteEtudiant(etudiant.id)}>Supprimer</button>
                      <button className="btn-modify" onClick={() => handleModifyEtudiant(etudiant.id)}>Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showEtudiantForm && (// Si showEtudiantForm est vrai, affiche un formulaire modal pour ajouter ou modifier un étudiant avec des champs pour l'email de l'étudiant et la classe assignée, ainsi que des boutons pour enregistrer ou annuler
          <div className="form-modal">
            <div className="form-container">
              <h3>Ajouter un étudiant</h3>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px'}}>
                Saisissez les informations de l'étudiant à ajouter.
              </p>
              
              <div className="form-group">
                <label>Email de l'étudiant *</label>
                <input type="email" value={etudiantFormData.email} onChange={(e) => setEtudiantFormData({ ...etudiantFormData, email: e.target.value })} placeholder="Ex: etudiant@student.com" />
              </div>
              
              <div className="form-group">
                <label>Classe assignée *</label>
                <select value={etudiantFormData.classe_id} onChange={(e) => setEtudiantFormData({ ...etudiantFormData, classe_id: e.target.value })}>
                  {classesList.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.niveau} - {classe.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleSaveEtudiant}>Ajouter</button>
                <button className="btn-cancel" onClick={handleCloseEtudiantForm}>Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}

export default GestionPage