import { useState, useEffect } from 'react'
import { commonCriteria, specificCriteria, appreciationScale, decisions } from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import GitHubService from '../services/githubService'

function EvaluationForm({ position, onFormChange, onSave, githubToken }) {
  const [formData, setFormData] = useState({
    nom: '',
    matricule: '',
    service: '',
    poste: '',
    superieur: '',
    dateDebut: '',
    dateFin: '',
    commonScores: {},
    specificScores: {},
    decisions: [],
    evaluateurNom: '',
    dateEvaluation: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    onFormChange(formData)
  }, [formData, onFormChange])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleScoreChange = (criteriaType, criteriaId, value) => {
    const score = Math.min(5, Math.max(0, parseFloat(value) || 0))
    setFormData(prev => ({
      ...prev,
      [`${criteriaType}Scores`]: {
        ...prev[`${criteriaType}Scores`],
        [criteriaId]: score
      }
    }))
  }

  const handleDecisionChange = (decisionId) => {
    setFormData(prev => ({
      ...prev,
      decisions: prev.decisions.includes(decisionId)
        ? prev.decisions.filter(d => d !== decisionId)
        : [...prev.decisions, decisionId]
    }))
  }

  const calculateTotal = () => {
    const commonTotal = Object.values(formData.commonScores).reduce((sum, score) => sum + (score || 0), 0)
    const specificTotal = Object.values(formData.specificScores).reduce((sum, score) => sum + (score || 0), 0)
    const maxCommon = commonCriteria.length * 5
    const maxSpecific = (specificCriteria[position]?.length || 0) * 5
    const percentage = ((commonTotal + specificTotal) / (maxCommon + maxSpecific)) * 100
    return { total: commonTotal + specificTotal, percentage: percentage.toFixed(1) }
  }

  const getAppreciation = (percentage) => {
    const scale = appreciationScale.find(s => percentage >= s.min && percentage <= s.max)
    return scale || appreciationScale[appreciationScale.length - 1]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { total, percentage } = calculateTotal()
    const appreciation = getAppreciation(percentage)
    const maxScore = (commonCriteria.length + (specificCriteria[position]?.length || 0)) * 5
    
    const evaluationData = {
      ...formData,
      totalScore: total,
      maxScore,
      percentage,
      appreciation: appreciation.label,
      timestamp: new Date().toISOString()
    }

    try {
      // Save to GitHub if token is available
      if (githubToken) {
        const githubService = new GitHubService(githubToken)
        await githubService.saveEvaluation(evaluationData)
      }
      
      onSave(evaluationData)
      alert('Évaluation enregistrée avec succès!')
      
      // Reset form
      setFormData({
        nom: '',
        matricule: '',
        service: '',
        poste: '',
        superieur: '',
        dateDebut: '',
        dateFin: '',
        commonScores: {},
        specificScores: {},
        decisions: [],
        evaluateurNom: '',
        dateEvaluation: format(new Date(), 'yyyy-MM-dd')
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde. Vérifiez votre token GitHub.')
    }
  }

  const positionCriteria = specificCriteria[position] || []
  const { total, percentage } = calculateTotal()
  const appreciation = getAppreciation(percentage)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom & Prénom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Matricule</label>
            <input
              type="text"
              name="matricule"
              value={formData.matricule}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Supérieur hiérarchique</label>
            <input
              type="text"
              name="superieur"
              value={formData.superieur}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Période d'évaluation</label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                className="form-input flex-1"
                required
              />
              <span>au</span>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleInputChange}
                className="form-input flex-1"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Critères communs (tous services)</h3>
        <div className="space-y-3">
          {commonCriteria.map(criteria => (
            <div key={criteria.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{criteria.label}</p>
                <p className="text-sm text-gray-600">{criteria.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.commonScores[criteria.id] || ''}
                  onChange={(e) => handleScoreChange('common', criteria.id, e.target.value)}
                  className="rating-input"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500">/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {positionCriteria.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Critères spécifiques</h3>
          <div className="space-y-3">
            {positionCriteria.map(criteria => (
              <div key={criteria.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{criteria.label}</p>
                  <p className="text-sm text-gray-600">{criteria.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={formData.specificScores[criteria.id] || ''}
                    onChange={(e) => handleScoreChange('specific', criteria.id, e.target.value)}
                    className="rating-input"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Note finale</h3>
        <div className="space-y-2">
          <p className="text-lg">
            Total points obtenus: <span className="font-bold">{total}</span> / {(commonCriteria.length + positionCriteria.length) * 5}
          </p>
          <p className="text-lg">
            Pourcentage: <span className="font-bold">{percentage}%</span>
          </p>
          <p className="text-lg">
            Appréciation générale: <span className={`font-bold ${appreciation.color}`}>{appreciation.label}</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Décision / Recommandations</h3>
        <div className="space-y-2">
          {decisions.map(decision => (
            <label key={decision.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.decisions.includes(decision.id)}
                onChange={() => handleDecisionChange(decision.id)}
                className="rounded text-hotel-gold focus:ring-hotel-gold"
              />
              <span>{decision.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Signature de l'évaluateur</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de l'évaluateur</label>
            <input
              type="text"
              name="evaluateurNom"
              value={formData.evaluateurNom}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="dateEvaluation"
              value={formData.dateEvaluation}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-hotel-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
      >
        Enregistrer l'évaluation
      </button>
    </form>
  )
}

export default EvaluationForm