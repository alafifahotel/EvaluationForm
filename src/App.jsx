import { useState, useEffect, useRef } from 'react'
import EvaluationForm from './components/EvaluationForm'
import PreviewA4 from './components/PreviewA4'
import HistoryTab from './components/HistoryTab'
import ParametresTab from './components/ParametresTab'
import OrganigrammeTab from './components/OrganigrammeTab'
import TokenModal from './components/TokenModal'
import CustomDropdown from './components/CustomDropdown'
import { FileEdit, History, Edit, Users, UserCheck, Briefcase, Settings, Network } from 'lucide-react'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { CriteriaProvider, useCriteria } from './contexts/CriteriaContext'
import { OrgChartProvider } from './contexts/OrgChartContext'

function AppContent({ githubToken, onTokenChange }) {
  const toast = useToast()
  const { positions, supervisorPositions, loadConfig } = useCriteria()
  const hasInitializedToken = useRef(false)

  // Get initial tab from URL hash or default to 'evaluation'
  const getInitialTab = () => {
    const hash = window.location.hash.slice(1)
    if (hash === 'history') return 'history'
    if (hash === 'parametres') return 'parametres'
    if (hash === 'organigramme') return 'organigramme'
    return 'evaluation'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [employeeType, setEmployeeType] = useState('') // 'employee' or 'supervisor'
  const [selectedPosition, setSelectedPosition] = useState('')
  const [formData, setFormData] = useState({})
  const [evaluations, setEvaluations] = useState([])
  const [editingEvaluation, setEditingEvaluation] = useState(null)
  const [showTokenModal, setShowTokenModal] = useState(false)

  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'history') setActiveTab('history')
      else if (hash === 'parametres') setActiveTab('parametres')
      else if (hash === 'organigramme') setActiveTab('organigramme')
      else setActiveTab('evaluation')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Initialize token on component mount
  useEffect(() => {
    // Use ref to ensure this only runs once
    if (hasInitializedToken.current) return
    hasInitializedToken.current = true

    if (!githubToken) {
      setShowTokenModal(true)
    }
  }, [githubToken])

  const handleTokenConfirm = async (token) => {
    if (token) {
      // Save token to localStorage for future sessions
      localStorage.setItem('evaluation_access_token', token)
      onTokenChange(token)
      toast.success('Token enregistré avec succès')
      // Reload criteria config with new token
      setTimeout(() => loadConfig(), 100)
    } else {
      // User chose to continue without token
      toast.warning('Mode local activé - synchronisation désactivée')
    }
    setShowTokenModal(false)
    return Promise.resolve()
  }

  const handleEmployeeTypeChange = (type) => {
    setEmployeeType(type)
    setSelectedPosition('')
    setFormData({})
  }

  const handlePositionChange = (e) => {
    const positionValue = e.target.value
    setSelectedPosition(positionValue)
    
    const positionsList = employeeType === 'supervisor' ? supervisorPositions : positions
    const selectedPos = positionsList.find(p => p.value === positionValue)
    
    setFormData({
      service: selectedPos?.label || '',
      poste: selectedPos?.label || '',
      employeeType: employeeType
    })
  }

  const handleFormChange = (data) => {
    setFormData(data)
  }

  const handleSaveEvaluation = (evaluation) => {
    if (editingEvaluation) {
      // Update existing evaluation
      setEvaluations(prev => prev.map(e => 
        e.githubPath === evaluation.githubPath ? evaluation : e
      ))
      setEditingEvaluation(null)
    } else {
      // Add new evaluation
      setEvaluations([...evaluations, evaluation])
    }
  }

  const handleEditEvaluation = (evaluation) => {
    // Set the evaluation to edit
    setEditingEvaluation(evaluation)
    const type = evaluation.employeeType || 'employee'
    setEmployeeType(type)
    
    const positionsList = type === 'supervisor' ? supervisorPositions : positions
    setSelectedPosition(positionsList.find(p => p.label === evaluation.service)?.value || '')
    setFormData(evaluation)
    setActiveTab('evaluation')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TokenModal 
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onConfirm={handleTokenConfirm}
        initialToken={githubToken}
      />
      
      <header className="bg-hotel-dark text-white py-6 px-8 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-hotel-gold">
              Al Afifa Hotel
            </h1>
            <p className="text-gray-300 mt-2">Fiche d'évaluation du personnel</p>
          </div>
          <button
            onClick={() => setShowTokenModal(true)}
            className="px-4 py-2 bg-hotel-gold/20 hover:bg-hotel-gold/30 text-hotel-gold border border-hotel-gold/50 rounded-lg transition-all duration-200 flex items-center gap-2"
            title="Configurer le token d'accès"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="hidden sm:inline">Token</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile: Dropdown select */}
        <div className="sm:hidden mb-4">
          <CustomDropdown
            name="activeTab"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            options={[
              { value: 'evaluation', label: 'Nouvelle Évaluation' },
              { value: 'history', label: 'Historique' },
              { value: 'organigramme', label: 'Organigramme' },
              { value: 'parametres', label: 'Paramètres' }
            ]}
            icon={activeTab === 'evaluation' ? FileEdit : activeTab === 'history' ? History : activeTab === 'organigramme' ? Network : Settings}
          />
        </div>

        {/* Desktop: Tab buttons */}
        <nav className="hidden sm:flex mb-0">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center px-6 py-3 font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'evaluation'
                ? 'bg-white text-hotel-gold shadow-[0_-2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300'
            }`}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Nouvelle Évaluation
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-6 py-3 font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'history'
                ? 'bg-white text-hotel-gold shadow-[0_-2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300'
            }`}
          >
            <History className="mr-2 h-4 w-4" />
            Historique
          </button>
          <button
            onClick={() => setActiveTab('organigramme')}
            className={`flex items-center px-6 py-3 font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'organigramme'
                ? 'bg-white text-hotel-gold shadow-[0_-2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Network className="mr-2 h-4 w-4" />
            Organigramme
          </button>
          <button
            onClick={() => setActiveTab('parametres')}
            className={`flex items-center px-6 py-3 font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'parametres'
                ? 'bg-white text-hotel-gold shadow-[0_-2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </button>
        </nav>

        {activeTab === 'evaluation' ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {editingEvaluation && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                  <Edit className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">
                    Mode édition : {editingEvaluation.nom} - {editingEvaluation.service}
                  </span>
                </div>
              )}
              
              {!editingEvaluation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de personnel à évaluer
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleEmployeeTypeChange('employee')}
                      className={`p-4 rounded-lg border transition-all ${
                        employeeType === 'employee'
                          ? 'border-hotel-gold bg-hotel-gold/10 text-hotel-gold'
                          : 'border-gray-300 hover:border-gray-400 text-gray-400'
                      }`}
                    >
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Personnel opérationnel</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Employés de service (réception, housekeeping, cuisine, etc.)
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleEmployeeTypeChange('supervisor')}
                      className={`p-4 rounded-lg border transition-all ${
                        employeeType === 'supervisor'
                          ? 'border-hotel-gold bg-hotel-gold/10 text-hotel-gold'
                          : 'border-gray-300 hover:border-gray-400 text-gray-400'
                      }`}
                    >
                      <UserCheck className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Personnel d'encadrement</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Responsables et superviseurs de département
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {(employeeType || editingEvaluation) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner le poste à évaluer
                  </label>
                  <CustomDropdown
                    name="position"
                    value={selectedPosition}
                    onChange={handlePositionChange}
                    options={(employeeType === 'supervisor' ? supervisorPositions : positions)}
                    placeholder="-- Choisir un poste --"
                    disabled={!!editingEvaluation}
                    searchable={true}
                    icon={Briefcase}
                  />
                </div>
              )}

              {(selectedPosition || editingEvaluation) && (
                <div className="grid grid-cols-1 xl:grid-cols-2">
                  <div className="xl:max-w-2xl">
                    <EvaluationForm
                      position={selectedPosition || (editingEvaluation?.employeeType === 'supervisor' ? supervisorPositions : positions).find(p => p.label === editingEvaluation?.service)?.value || ''}
                      positionLabel={(employeeType === 'supervisor' ? supervisorPositions : positions).find(p => p.value === selectedPosition)?.label || editingEvaluation?.service || ''}
                      employeeType={employeeType || editingEvaluation?.employeeType || 'employee'}
                      onFormChange={handleFormChange}
                      onSave={handleSaveEvaluation}
                      githubToken={githubToken}
                      initialData={editingEvaluation}
                      isEditing={!!editingEvaluation}
                      onCancel={() => {
                        setEditingEvaluation(null)
                        setSelectedPosition('')
                        setEmployeeType('')
                        setFormData({})
                      }}
                    />
                  </div>
                  <div className="xl:sticky xl:top-6 mt-6 sm:mt-0">
                    <h3 className="text-lg font-semibold mb-4">
                      Aperçu du document
                    </h3>
                    <div className="border-2 border-gray-300 rounded-lg overflow-auto max-h-100vh shadow-xl">
                      <PreviewA4 
                        formData={formData} 
                        position={selectedPosition || (editingEvaluation?.employeeType === 'supervisor' ? supervisorPositions : positions).find(p => p.label === editingEvaluation?.service)?.value || ''}
                        employeeType={employeeType || editingEvaluation?.employeeType || 'employee'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'history' ? (
          <HistoryTab
            evaluations={evaluations}
            githubToken={githubToken}
            onEditEvaluation={handleEditEvaluation}
          />
        ) : activeTab === 'organigramme' ? (
          <OrganigrammeTab githubToken={githubToken} />
        ) : (
          <ParametresTab githubToken={githubToken} />
        )}
      </div>
    </div>
  )
}

function App() {
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('evaluation_access_token') || ''
  })

  return (
    <ToastProvider>
      <CriteriaProvider githubToken={githubToken}>
        <OrgChartProvider githubToken={githubToken}>
          <AppContent githubToken={githubToken} onTokenChange={setGithubToken} />
        </OrgChartProvider>
      </CriteriaProvider>
    </ToastProvider>
  )
}

export default App