import { useState, useEffect } from 'react'
import { 
  commonCriteria, 
  specificCriteria, 
  appreciationScale, 
  supervisorAppreciationScale,
  supervisorTechnicalCriteria,
  supervisorBehavioralCriteria,
  decisions 
} from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import GitHubService from '../services/githubService'
import LoadingButton from './LoadingButton'
import { Save, X, CheckCircle, User, Hash, Briefcase, Users, Calendar, PenTool, CalendarCheck, ClipboardList, Target, Trophy, FileCheck } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

function EvaluationForm({ position, positionLabel, employeeType = 'employee', onFormChange, onSave, githubToken, initialData, isEditing, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const [formData, setFormData] = useState(initialData || {
    nom: '',
    matricule: '',
    service: positionLabel || '',
    poste: positionLabel || '',
    superieur: '',
    dateDebut: '',
    dateFin: '',
    commonScores: {},
    specificScores: {},
    technicalScores: {},
    behavioralScores: {},
    decisions: [],
    evaluateurNom: '',
    dateEvaluation: format(new Date(), 'yyyy-MM-dd'),
    employeeType: employeeType
  })

  useEffect(() => {
    // Update form when editing
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    // Update service and poste when position changes (only if not editing)
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        service: positionLabel || '',
        poste: positionLabel || '',
        employeeType: employeeType
      }))
    }
  }, [positionLabel, isEditing, employeeType])

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
    const maxScore = employeeType === 'supervisor' ? 10 : 5
    const score = Math.min(maxScore, Math.max(0, parseFloat(value) || 0))
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
    if (employeeType === 'supervisor') {
      const technicalTotal = Object.values(formData.technicalScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const behavioralTotal = Object.values(formData.behavioralScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const total = technicalTotal + behavioralTotal
      const maxTechnical = supervisorTechnicalCriteria.length * 10 // 6 criteria * 10 points = 60
      const maxBehavioral = supervisorBehavioralCriteria.length * 10 // 6 criteria * 10 points = 60
      const maxTotal = maxTechnical + maxBehavioral // 120 points total
      const percentage = (total / maxTotal) * 100
      return { total, percentage: percentage.toFixed(1), technicalTotal, behavioralTotal, maxTechnical, maxBehavioral, maxTotal }
    } else {
      const commonTotal = Object.values(formData.commonScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const specificTotal = Object.values(formData.specificScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const maxCommon = commonCriteria.length * 5
      const maxSpecific = (specificCriteria[position]?.length || 0) * 5
      const percentage = ((commonTotal + specificTotal) / (maxCommon + maxSpecific)) * 100
      return { total: commonTotal + specificTotal, percentage: percentage.toFixed(1) }
    }
  }

  const getAppreciation = (percentage) => {
    const scale = employeeType === 'supervisor' ? supervisorAppreciationScale : appreciationScale
    const scaleItem = scale.find(s => percentage >= s.min && percentage <= s.max)
    return scaleItem || scale[scale.length - 1]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const calculatedValues = calculateTotal()
      const { total, percentage } = calculatedValues
      const appreciation = getAppreciation(percentage)
      
      let maxScore
      if (employeeType === 'supervisor') {
        maxScore = supervisorTechnicalCriteria.length * 10 + supervisorBehavioralCriteria.length * 10 // 120 points total
      } else {
        maxScore = (commonCriteria.length + (specificCriteria[position]?.length || 0)) * 5
      }
      
      const evaluationData = {
        ...formData,
        totalScore: total,
        maxScore,
        percentage,
        appreciation: appreciation.label,
        bonusEligible: appreciation.bonusEligible || null,
        technicalTotal: calculatedValues.technicalTotal || null,
        behavioralTotal: calculatedValues.behavioralTotal || null,
        timestamp: isEditing ? formData.timestamp : new Date().toISOString(),
        githubPath: formData.githubPath // Preserve GitHub path if editing
      }
      // Save to GitHub if token is available
      if (githubToken) {
        const githubService = new GitHubService(githubToken)
        
        if (isEditing && evaluationData.githubPath) {
          // Update existing evaluation
          await githubService.updateEvaluation(evaluationData.githubPath, evaluationData)
        } else {
          // Create new evaluation
          const savedData = await githubService.saveEvaluation(evaluationData)
          evaluationData.githubPath = savedData.githubPath
        }
      }
      
      onSave(evaluationData)
      toast.success(isEditing ? '✅ Évaluation mise à jour avec succès!' : '✅ Évaluation enregistrée avec succès!')
      
      // Reset form only if not editing
      if (!isEditing) {
        setFormData({
          nom: '',
          matricule: '',
          service: positionLabel || '',
          poste: positionLabel || '',
          superieur: '',
          dateDebut: '',
          dateFin: '',
          commonScores: {},
          specificScores: {},
          technicalScores: {},
          behavioralScores: {},
          decisions: [],
          evaluateurNom: '',
          dateEvaluation: format(new Date(), 'yyyy-MM-dd'),
          employeeType: employeeType
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('❌ Erreur lors de la sauvegarde. Vérifiez votre token d\'accès.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const positionCriteria = specificCriteria[position] || []
  const calculatedValues = calculateTotal()
  const { total, percentage } = calculatedValues
  const appreciation = getAppreciation(percentage)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enhanced Mobile General Information Section */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-hotel-gold rounded-lg">
            <User className="h-4 w-4 text-white" />
          </div>
          Informations générales
        </h3>
        
        {/* Mobile-optimized form layout */}
        <div className="space-y-4">
          {/* Employee Identity Section */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <User className="h-3 w-3" />
              Identité de l'employé
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-all text-sm"
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400" />
                  Matricule
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-all text-sm"
                  placeholder="Ex: EMP001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Position Section */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              Poste et service
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-gray-400" />
                  Service
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md text-sm font-medium text-gray-700 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Auto</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-gray-400" />
                  Poste
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md text-sm font-medium text-gray-700 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Auto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchy Section */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Hiérarchie
            </h4>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-400" />
                Supérieur hiérarchique
              </label>
              <input
                type="text"
                name="superieur"
                value={formData.superieur}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-all text-sm"
                placeholder="Ex: Marie Martin"
                required
              />
            </div>
          </div>

          {/* Evaluation Period Section - Enhanced for Mobile */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar className="h-3 w-3 text-blue-600" />
              Période d'évaluation
            </h4>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-end">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Date de début
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 pl-9 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-hotel-gold focus:border-transparent transition-all text-sm"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="hidden sm:flex items-center justify-center px-2">
                <span className="text-gray-400 font-medium">→</span>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Date de fin
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 pl-9 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-hotel-gold focus:border-transparent transition-all text-sm"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Period Display for Mobile */}
            {formData.dateDebut && formData.dateFin && (
              <div className="mt-3 p-2 bg-blue-100 rounded-md sm:hidden">
                <p className="text-xs text-blue-800 text-center font-medium">
                  Période: {format(new Date(formData.dateDebut), 'dd MMM yyyy', { locale: fr })} - {format(new Date(formData.dateFin), 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Criteria Sections - Different for Employees and Supervisors */}
      {employeeType === 'supervisor' ? (
        <>
          {/* Technical Skills Section for Supervisors */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              Compétences Techniques
              <span className="text-xs font-normal text-gray-500">(60 points)</span>
            </h3>
            <div className="space-y-3">
              {supervisorTechnicalCriteria.map(criteria => (
                <div key={criteria.id} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm sm:text-base font-medium text-gray-800">{criteria.label}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{criteria.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.technicalScores[criteria.id] || ''}
                        onChange={(e) => handleScoreChange('technical', criteria.id, e.target.value)}
                        className="w-16 px-2 py-1.5 text-sm text-center bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Skills Section for Supervisors */}
          <div className="bg-gradient-to-b from-purple-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-purple-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm">
                <Target className="h-4 w-4 text-white" />
              </div>
              Comportement & Attitude
              <span className="text-xs font-normal text-gray-500">(40 points)</span>
            </h3>
            <div className="space-y-3">
              {supervisorBehavioralCriteria.map(criteria => (
                <div key={criteria.id} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm sm:text-base font-medium text-gray-800">{criteria.label}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{criteria.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.behavioralScores[criteria.id] || ''}
                        onChange={(e) => handleScoreChange('behavioral', criteria.id, e.target.value)}
                        className="w-16 px-2 py-1.5 text-sm text-center bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Enhanced Common Criteria Section for Employees */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              Critères communs
              <span className="text-xs font-normal text-gray-500">(tous services)</span>
            </h3>
            <div className="space-y-3">
              {commonCriteria.map(criteria => (
                <div key={criteria.id} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm sm:text-base font-medium text-gray-800">{criteria.label}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{criteria.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={formData.commonScores[criteria.id] || ''}
                        onChange={(e) => handleScoreChange('common', criteria.id, e.target.value)}
                        className="w-16 px-2 py-1.5 text-sm text-center bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Specific Criteria Section for Employees */}
          {positionCriteria.length > 0 && (
            <div className="bg-gradient-to-b from-purple-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-purple-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm">
                  <Target className="h-4 w-4 text-white" />
                </div>
                Critères spécifiques
                <span className="text-xs font-normal text-gray-500">({positionLabel})</span>
              </h3>
              <div className="space-y-3">
                {positionCriteria.map(criteria => (
                  <div key={criteria.id} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <p className="text-sm sm:text-base font-medium text-gray-800">{criteria.label}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{criteria.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          value={formData.specificScores[criteria.id] || ''}
                          onChange={(e) => handleScoreChange('specific', criteria.id, e.target.value)}
                          className="w-16 px-2 py-1.5 text-sm text-center bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Final Score Section */}
      <div className="bg-gradient-to-b from-yellow-50 to-amber-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg shadow-sm">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          Note finale
        </h3>
        <div className="bg-white rounded-lg p-4 border border-yellow-100">
          <div className="space-y-3">
            {employeeType === 'supervisor' && calculatedValues.technicalTotal !== undefined && (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-gray-700">Total Compétences Techniques:</p>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{calculatedValues.technicalTotal} / {calculatedValues.maxTechnical || 60}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-gray-700">Total Comportement & Attitude:</p>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{calculatedValues.behavioralTotal} / {calculatedValues.maxBehavioral || 60}</span>
                </div>
                <div className="border-t pt-2"></div>
              </>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-base text-gray-700">Total points obtenus:</p>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {total} / {employeeType === 'supervisor' ? (supervisorTechnicalCriteria.length * 10 + supervisorBehavioralCriteria.length * 10) : (commonCriteria.length + positionCriteria.length) * 5}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-base text-gray-700">
                {employeeType === 'supervisor' ? 'Score final:' : 'Pourcentage:'}
              </p>
              <span className="text-sm sm:text-base font-bold text-gray-900">{percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-base text-gray-700">Appréciation générale:</p>
              <span className={`text-sm sm:text-base font-bold px-3 py-1 rounded-full ${
                appreciation.color === 'text-green-600' ? 'bg-green-100 text-green-800' :
                appreciation.color === 'text-blue-600' ? 'bg-blue-100 text-blue-800' :
                appreciation.color === 'text-indigo-600' ? 'bg-indigo-100 text-indigo-800' :
                appreciation.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{appreciation.label}</span>
            </div>
            {employeeType === 'supervisor' && appreciation.bonusEligible && (
              <div className="flex justify-between items-center border-t pt-2">
                <p className="text-sm sm:text-base text-gray-700">Éligibilité prime:</p>
                <span className="text-sm sm:text-base font-semibold text-green-700">{appreciation.bonusEligible}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Decisions Section */}
      <div className="bg-gradient-to-b from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg border border-orange-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-sm">
            <FileCheck className="h-4 w-4 text-white" />
          </div>
          Décision / Recommandations
        </h3>
        <div className="bg-white rounded-lg p-3 border border-orange-100">
          <div className="space-y-2">
            {decisions.map(decision => (
              <label key={decision.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-orange-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.decisions.includes(decision.id)}
                  onChange={() => handleDecisionChange(decision.id)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-sm sm:text-base text-gray-700">{decision.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Evaluator Signature Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border border-green-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm">
            <PenTool className="h-4 w-4 text-white" />
          </div>
          Signature de l'évaluateur
        </h3>
        
        {/* Mobile-optimized signature layout */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100">
          <div className="space-y-4">
            {/* Evaluator Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-3 w-3 text-green-600" />
                Nom de l'évaluateur
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="evaluateurNom"
                  value={formData.evaluateurNom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 pl-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-sm placeholder-gray-400"
                  placeholder="Ex: Directeur des Ressources Humaines"
                  required
                />
                <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                {formData.evaluateurNom && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              {formData.evaluateurNom && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Évaluateur enregistré
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarCheck className="h-3 w-3 text-green-600" />
                Date de l'évaluation
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateEvaluation"
                  value={formData.dateEvaluation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 pl-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  required
                />
                <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
              </div>
              {formData.dateEvaluation && (
                <p className="mt-1.5 text-xs text-gray-600">
                  Évaluation du: <span className="font-medium text-green-700">
                    {format(new Date(formData.dateEvaluation), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </span>
                </p>
              )}
            </div>

            {/* Signature Visual Confirmation - Mobile Only */}
            {formData.evaluateurNom && formData.dateEvaluation && (
              <div className="sm:hidden mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-800">Prêt pour signature</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {formData.evaluateurNom} • {format(new Date(formData.dateEvaluation), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Signature Preview */}
            {formData.evaluateurNom && formData.dateEvaluation && (
              <div className="hidden sm:block mt-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-lg border-2 border-dashed border-green-300">
                <div className="text-center">
                  <PenTool className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Document prêt à être signé par</p>
                  <p className="text-lg font-bold text-green-700 mt-1">{formData.evaluateurNom}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Le {format(new Date(formData.dateEvaluation), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Info Note */}
        <div className="sm:hidden mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 flex items-start gap-1.5">
            <span className="text-blue-600">ℹ️</span>
            <span>Cette signature confirme l'exactitude des informations d'évaluation.</span>
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <LoadingButton
          type="submit"
          className="flex-1"
          icon={isEditing ? CheckCircle : Save}
          isLoading={isSubmitting}
          variant="primary"
          size="lg"
        >
          {isEditing ? 'Mettre à jour l\'évaluation' : 'Enregistrer l\'évaluation'}
        </LoadingButton>
        {isEditing && (
          <LoadingButton
            type="button"
            onClick={onCancel || (() => window.location.reload())}
            icon={X}
            variant="secondary"
            size="lg"
          >
            Annuler
          </LoadingButton>
        )}
      </div>
    </form>
  )
}

export default EvaluationForm