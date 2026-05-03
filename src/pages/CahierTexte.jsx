import DashboardLayout from '../components/DashboardLayout'
import './CahierTexte.css'
import { useState, useRef } from 'react'
import SignaturePad from 'signature_pad'

function CahierTexte() {
  const [cahiers, setCahiers] = useState([
    { id: 1, classe: 'Licence 1', matiere: 'Mathématiques', date: '2025-04-17', statut: 'Signé', enseignant: 'M. SANOGO' },
    { id: 2, classe: 'Licence 1', matiere: 'Physique', date: '2025-04-16', statut: 'Brouillon', enseignant: 'Dr BERE' },
  ])

  const [showForm, setShowForm] = useState(false) //affiche et cache le formulaire de creation
  const [formData, setFormData] = useState({
    classe: '',
    matiere: '',
    titre_cours: '',
    contenu: '',
    points_vus: '',
    niveau_avancement: '',
    travaux_demandes: '',
    observations: ''
  })

  const [currentCahier, setCurrentCahier] = useState(null)
  //pour les signatures numeriques
  const canvasDeleguRef = useRef()
  const canvasEnseignantRef = useRef()
  let signaturePadDelegu, signaturePadEnseignant

  //cette fonction met à jour le champs du formulaire,,,pour tous les input et select du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  //initialise les canvs de signature
  const initSignaturePads = () => {
    if (canvasDeleguRef.current && !signaturePadDelegu) {
      signaturePadDelegu = new SignaturePad(canvasDeleguRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: '#000000'
      })
    }
    if (canvasEnseignantRef.current && !signaturePadEnseignant) {
      signaturePadEnseignant = new SignaturePad(canvasEnseignantRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: '#000000'
      })
    }
  }

  //ouvre le formulaire de creation,,,reinitialise le formulaire et initialise les canva de signature
  const handleCreateCahier = () => {
    setShowForm(true)
    setCurrentCahier(null)

    setFormData({ //vide le formulaire
      classe: '',
      matiere: '',
      titre_cours: '',
      contenu: '',
      points_vus: '',
      niveau_avancement: '',
      travaux_demandes: '',
      observations: ''
    })
    setTimeout(initSignaturePads, 100)
  }
//valide les donnees obligatoires, verifie que les deux sigatures sont presentes, puis creer un nouveau cahier avec les signatures en base 64
  const handleSaveCahier = async () => {
    //verifie les champs obligatoires
    if (!formData.classe || !formData.titre_cours) {
      alert('Veuillez remplir les champs obligatoires')
      return
    }
     //initialise les signatures au cas ou
    initSignaturePads()
//verifie que les deux signatures sont presentes
    if (signaturePadDelegu.isEmpty() || signaturePadEnseignant.isEmpty()) {
      alert('Les deux signatures sont obligatoires')
      return
    }

    const newCahier = {
      id: cahiers.length + 1,
      classe: formData.classe,
      matiere: formData.matiere,
      date: new Date().toISOString().split('T')[0],
      statut: 'Signé',
      enseignant: 'Enseignant',
      titre: formData.titre_cours,
      contenu: formData.contenu,
      points_vus: formData.points_vus,
      niveau_avancement: formData.niveau_avancement,
      travaux_demandes: formData.travaux_demandes,
      observations: formData.observations,
      signature_delegu: signaturePadDelegu.toDataURL(),
      signature_enseignant: signaturePadEnseignant.toDataURL()
    }
    //Ajoute un nouveau cahier au debut de la liste
    setCahiers([newCahier, ...cahiers])

    //ferme le formulaire et affiche un message de succes
    setShowForm(false)
    alert('✅ Cahier de texte enregistré et signé')
  }
//efface une signature et permet a l'utilisateur de recommencer sa signature si il s'est trompé
  const handleClearSignature = (pad) => {
    if (pad === 'delegu') signaturePadDelegu?.clear()
    if (pad === 'enseignant') signaturePadEnseignant?.clear()
  }

  const handleViewCahier = (cahier) => {
    setCurrentCahier(cahier)
  }

  return (
    <DashboardLayout>
      <h2>Cahiers de Texte</h2>

      {!showForm && !currentCahier && (
        <>
          <button className="btn-create" onClick={handleCreateCahier}>+ Nouveau cahier</button>

          <div className="cahier-table-container">
            <table className="cahier-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Date</th>
                  <th>Titre du Cours</th>
                  <th>Enseignant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cahiers.map(cahier => (
                  <tr key={cahier.id}>
                    <td>{cahier.classe}</td>
                    <td>{cahier.matiere}</td>
                    <td>{cahier.date}</td>
                    <td>{cahier.titre || '-'}</td>
                    <td>{cahier.enseignant}</td>
                    <td><span className={`badge badge-${cahier.statut.toLowerCase()}`}>{cahier.statut}</span></td>
                    <td>
                      <button className="btn-action" onClick={() => handleViewCahier(cahier)}>Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <div className="cahier-form-container">
          <div className="cahier-form-card">
            <h4>📝 Nouveau Cahier de Texte</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Classe *</label>
                <select name="classe" value={formData.classe} onChange={handleInputChange}>
                  <option value="">Sélectionner une classe</option>
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                </select>
              </div>

              <div className="form-group">
                <label>Matière *</label>
                <select name="matiere" value={formData.matiere} onChange={handleInputChange}>
                  <option value="">Sélectionner une matière</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Développement Web">Développement Web</option>
                  <option value="Programmation C/C++">Programmation C/C++</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Titre du Cours *</label>
              <input type="text" name="titre_cours" value={formData.titre_cours} onChange={handleInputChange} placeholder="Ex: Chapitre 3 - Les Boucles" />
            </div>

            <div className="form-group">
              <label>Contenu du Cours</label>
              <textarea name="contenu" value={formData.contenu} onChange={handleInputChange} placeholder="Détails du contenu..." rows="3"></textarea>
            </div>

            <div className="form-group">
              <label>Points Vus</label>
              <textarea name="points_vus" value={formData.points_vus} onChange={handleInputChange} placeholder="Lister les notions couvertes" rows="2"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Niveau d'Avancement (%)</label>
                <input type="number" name="niveau_avancement" value={formData.niveau_avancement} onChange={handleInputChange} placeholder="Ex: 75" min="0" max="100" />
              </div>

              <div className="form-group">
                <label>Travaux Demandés</label>
                <input type="text" name="travaux_demandes" value={formData.travaux_demandes} onChange={handleInputChange} placeholder="Ex: Exercices 1-5, page 25" />
              </div>
            </div>

            <div className="form-group">
              <label>Observations</label>
              <textarea name="observations" value={formData.observations} onChange={handleInputChange} placeholder="Incidents, absences, retards..." rows="2"></textarea>
            </div>

            <div className="signatures-section">
              <h5>✍️ Signatures Numériques</h5>

              <div className="signature-grid">
                <div className="signature-box">
                  <label>Signature Délégué</label>
                  <canvas ref={canvasDeleguRef} className="signature-canvas"></canvas>
                  <button type="button" className="btn-clear" onClick={() => handleClearSignature('delegu')}>Effacer</button>
                </div>

                <div className="signature-box">
                  <label>Signature Enseignant</label>
                  <canvas ref={canvasEnseignantRef} className="signature-canvas"></canvas>
                  <button type="button" className="btn-clear" onClick={() => handleClearSignature('enseignant')}>Effacer</button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-save" onClick={handleSaveCahier}>✅ Enregistrer et Signer</button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>❌ Annuler</button>
            </div>
          </div>
        </div>
      )}

      {currentCahier && (
        <div className="cahier-view-container">
          <button className="btn-back" onClick={() => setCurrentCahier(null)}>← Retour</button>

          <div className="cahier-view-card">
            <div className="cahier-header">
              <div>
                <h4>{currentCahier.titre || 'Cahier de Texte'}</h4>
                <p><strong>Classe:</strong> {currentCahier.classe} | <strong>Matière:</strong> {currentCahier.matiere} | <strong>Date:</strong> {currentCahier.date}</p>
              </div>
              <span className={`badge badge-${currentCahier.statut.toLowerCase()}`}>{currentCahier.statut}</span>
            </div>

            <div className="cahier-content">
              {currentCahier.contenu && <div><strong>Contenu:</strong> <p>{currentCahier.contenu}</p></div>}
              {currentCahier.points_vus && <div><strong>Points Vus:</strong> <p>{currentCahier.points_vus}</p></div>}
              {currentCahier.niveau_avancement && <div><strong>Avancement:</strong> <p>{currentCahier.niveau_avancement}%</p></div>}
              {currentCahier.travaux_demandes && <div><strong>Travaux:</strong> <p>{currentCahier.travaux_demandes}</p></div>}
              {currentCahier.observations && <div><strong>Observations:</strong> <p>{currentCahier.observations}</p></div>}
            </div>

            {currentCahier.signature_delegu && currentCahier.signature_enseignant && (
              <div className="signatures-view">
                <h5>Signatures</h5>
                <div className="signatures-grid">
                  <div>
                    <p><strong>Signature Délégué</strong></p>
                    <img src={currentCahier.signature_delegu} alt="Signature délégué" className="signature-img" />
                  </div>
                  <div>
                    <p><strong>Signature Enseignant</strong></p>
                    <img src={currentCahier.signature_enseignant} alt="Signature enseignant" className="signature-img" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default CahierTexte