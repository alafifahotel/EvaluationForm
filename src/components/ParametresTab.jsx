import { useState } from 'react'
import { Users, UserCheck, Save, RefreshCw, AlertCircle, CheckCircle, List, Layers, Lock, Eye, EyeOff } from 'lucide-react'
import { useCriteria } from '../contexts/CriteriaContext'
import { useToast } from '../contexts/ToastContext'
import PositionManager from './PositionManager'
import CriteriaEditor from './CriteriaEditor'
import LoadingSpinner from './LoadingSpinner'

// Module-level variable to persist auth across tab switches (resets on page refresh)
let sessionAuthenticated = false

function ParametresTab({ githubToken }) {
  const toast = useToast()
  const {
    config,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    updateConfig,
    saveConfig,
    resetToDefaults
  } = useCriteria()

  const [activeSection, setActiveSection] = useState('employees') // 'employees' | 'supervisors'
  const [selectedEmployeePosition, setSelectedEmployeePosition] = useState('')
  const [selectedSupervisorPosition, setSelectedSupervisorPosition] = useState('')

  // Password protection state (initialized from module-level variable)
  const [isAuthenticated, setIsAuthenticated] = useState(sessionAuthenticated)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === 'MANAGEMENT') {
      sessionAuthenticated = true // Persist across tab switches
      setIsAuthenticated(true)
      setPassword('')
      setPasswordError('')
    } else {
      setPasswordError('Mot de passe incorrect')
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!githubToken) {
      toast.error('Token GitHub requis pour sauvegarder')
      return
    }

    const result = await saveConfig()
    if (result.success) {
      toast.success('Configuration sauvegardée avec succès')
    } else {
      toast.error(`Erreur: ${result.error}`)
    }
  }

  // Handle reset to defaults
  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les critères aux valeurs par défaut ?')) {
      resetToDefaults()
      toast.info('Configuration réinitialisée (non sauvegardée)')
    }
  }

  // Update employee positions
  const handleAddEmployeePosition = (newPosition) => {
    updateConfig(prev => ({
      ...prev,
      employees: {
        ...prev.employees,
        positions: [...prev.employees.positions, newPosition],
        specificCriteria: {
          ...prev.employees.specificCriteria,
          [newPosition.value]: []
        }
      }
    }))
  }

  const handleDeleteEmployeePosition = (positionValue) => {
    updateConfig(prev => {
      const newSpecificCriteria = { ...prev.employees.specificCriteria }
      delete newSpecificCriteria[positionValue]

      return {
        ...prev,
        employees: {
          ...prev.employees,
          positions: prev.employees.positions.filter(p => p.value !== positionValue),
          specificCriteria: newSpecificCriteria
        }
      }
    })
  }

  // Update supervisor positions
  const handleAddSupervisorPosition = (newPosition) => {
    updateConfig(prev => ({
      ...prev,
      supervisors: {
        ...prev.supervisors,
        positions: [...prev.supervisors.positions, newPosition]
      }
    }))
  }

  const handleDeleteSupervisorPosition = (positionValue) => {
    updateConfig(prev => ({
      ...prev,
      supervisors: {
        ...prev.supervisors,
        positions: prev.supervisors.positions.filter(p => p.value !== positionValue)
      }
    }))
  }

  // Update common criteria
  const handleUpdateCommonCriteria = (newCriteria) => {
    updateConfig(prev => ({
      ...prev,
      employees: {
        ...prev.employees,
        commonCriteria: newCriteria
      }
    }))
  }

  // Update specific criteria for a position
  const handleUpdateSpecificCriteria = (positionValue, newCriteria) => {
    updateConfig(prev => ({
      ...prev,
      employees: {
        ...prev.employees,
        specificCriteria: {
          ...prev.employees.specificCriteria,
          [positionValue]: newCriteria
        }
      }
    }))
  }

  // Update technical criteria
  const handleUpdateTechnicalCriteria = (newCriteria) => {
    updateConfig(prev => ({
      ...prev,
      supervisors: {
        ...prev.supervisors,
        technicalCriteria: newCriteria
      }
    }))
  }

  // Update behavioral criteria
  const handleUpdateBehavioralCriteria = (newCriteria) => {
    updateConfig(prev => ({
      ...prev,
      supervisors: {
        ...prev.supervisors,
        behavioralCriteria: newCriteria
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <LoadingSpinner text="Chargement de la configuration..." />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Impossible de charger la configuration</p>
          {error && <p className="text-sm mt-2">{error}</p>}
        </div>
      </div>
    )
  }

  // Password protection layer
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-hotel-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-hotel-gold" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Accès protégé</h2>
            <p className="text-sm text-gray-500 mt-1">
              Entrez le mot de passe pour accéder aux paramètres
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl focus:outline-none focus:border-hotel-gold hover:border-hotel-gold/50 hover:shadow-md transition-all duration-300 ${
                    passwordError ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Entrez le mot de passe"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-gold/90 transition-colors font-medium"
            >
              Accéder aux paramètres
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Paramètres des critères</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les critères d'évaluation pour chaque type de personnel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Non sauvegardé
              </span>
            )}

            <button
              onClick={handleReset}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
              title="Réinitialiser aux valeurs par défaut"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges || !githubToken}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                hasUnsavedChanges && githubToken
                  ? 'bg-hotel-gold text-white hover:bg-hotel-gold/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveSection('employees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === 'employees'
                ? 'bg-hotel-gold text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Personnel opérationnel
          </button>
          <button
            onClick={() => setActiveSection('supervisors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeSection === 'supervisors'
                ? 'bg-hotel-gold text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Personnel d'encadrement
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeSection === 'employees' ? (
          <div className="space-y-6">
            {/* Position Manager */}
            <PositionManager
              positions={config.employees?.positions || []}
              selectedPosition={selectedEmployeePosition}
              onSelectPosition={(e) => setSelectedEmployeePosition(e.target.value)}
              onAddPosition={handleAddEmployeePosition}
              onDeletePosition={handleDeleteEmployeePosition}
              label="Gestion des postes"
              placeholder="-- Sélectionner un poste pour voir ses critères --"
            />

            {/* Common Criteria */}
            <CriteriaEditor
              title="Critères communs"
              icon={List}
              criteria={config.employees?.commonCriteria || []}
              onUpdate={handleUpdateCommonCriteria}
              maxCriteria={config.employees?.scoring?.maxCriteria || 6}
              maxScore={config.employees?.scoring?.maxPerCriterion || 5}
              emptyMessage="Aucun critère commun défini"
            />

            {/* Position-Specific Criteria */}
            {selectedEmployeePosition && (
              <CriteriaEditor
                title={`Critères spécifiques - ${config.employees?.positions?.find(p => p.value === selectedEmployeePosition)?.label || ''}`}
                icon={Layers}
                criteria={config.employees?.specificCriteria?.[selectedEmployeePosition] || []}
                onUpdate={(newCriteria) => handleUpdateSpecificCriteria(selectedEmployeePosition, newCriteria)}
                maxCriteria={config.employees?.scoring?.maxCriteria || 6}
                maxScore={config.employees?.scoring?.maxPerCriterion || 5}
                emptyMessage="Aucun critère spécifique pour ce poste"
              />
            )}

            {!selectedEmployeePosition && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-blue-700">
                <p>Sélectionnez un poste ci-dessus pour gérer ses critères spécifiques</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Supervisor Position Manager */}
            <PositionManager
              positions={config.supervisors?.positions || []}
              selectedPosition={selectedSupervisorPosition}
              onSelectPosition={(e) => setSelectedSupervisorPosition(e.target.value)}
              onAddPosition={handleAddSupervisorPosition}
              onDeletePosition={handleDeleteSupervisorPosition}
              label="Gestion des postes d'encadrement"
              placeholder="-- Sélectionner un poste --"
            />

            {/* Technical Criteria */}
            <CriteriaEditor
              title="Compétences techniques"
              icon={List}
              criteria={config.supervisors?.technicalCriteria || []}
              onUpdate={handleUpdateTechnicalCriteria}
              maxCriteria={config.supervisors?.scoring?.maxCriteria || 6}
              maxScore={config.supervisors?.scoring?.maxPerCriterion || 10}
              emptyMessage="Aucune compétence technique définie"
            />

            {/* Behavioral Criteria */}
            <CriteriaEditor
              title="Compétences comportementales"
              icon={Layers}
              criteria={config.supervisors?.behavioralCriteria || []}
              onUpdate={handleUpdateBehavioralCriteria}
              maxCriteria={config.supervisors?.scoring?.maxCriteria || 6}
              maxScore={config.supervisors?.scoring?.maxPerCriterion || 10}
              emptyMessage="Aucune compétence comportementale définie"
            />
          </div>
        )}
      </div>

      {/* Footer with token warning */}
      {!githubToken && (
        <div className="p-4 border-t border-gray-200 bg-yellow-50">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Token GitHub requis pour sauvegarder les modifications. Configurez votre token dans l'en-tête.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParametresTab
