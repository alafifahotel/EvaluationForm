import { useState, useEffect } from 'react'
import EvaluationForm from './components/EvaluationForm'
import PreviewA4 from './components/PreviewA4'
import HistoryTab from './components/HistoryTab'
import { positions, supervisorPositions } from './data/criteriaConfig'
import { FileEdit, History, Edit, Users, UserCheck } from 'lucide-react'
import { ToastProvider, useToast } from './contexts/ToastContext'

function AppContent() {
  const toast = useToast()
  // Get initial tab from URL hash or default to 'evaluation'
  const getInitialTab = () => {
    const hash = window.location.hash.slice(1)
    return hash === 'history' ? 'history' : 'evaluation'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [employeeType, setEmployeeType] = useState('') // 'employee' or 'supervisor'
  const [selectedPosition, setSelectedPosition] = useState('')
  const [formData, setFormData] = useState({})
  const [githubToken, setGithubToken] = useState('')
  const [evaluations, setEvaluations] = useState([])
  const [editingEvaluation, setEditingEvaluation] = useState(null)

  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setActiveTab(hash === 'history' ? 'history' : 'evaluation')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setGithubToken(savedToken)
    } else {
      const token = prompt('Veuillez entrer votre token GitHub:')
      if (token) {
        localStorage.setItem('github_token', token)
        setGithubToken(token)
        toast.success('🔐 Token GitHub enregistré avec succès')
      } else {
        toast.warning('⚠️ Aucun token GitHub fourni - fonctionnement en mode local')
      }
    }
  }, [])

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
      <header className="bg-hotel-dark text-white py-6 px-8 shadow-lg">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-hotel-gold">
            Al Afifa Hotel
          </h1>
          <p className="text-gray-300 mt-2">Fiche d'évaluation du personnel</p>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('evaluation')}
                className={`flex items-center px-6 py-3 font-medium transition-all duration-200 ${
                  activeTab === 'evaluation'
                    ? 'border-b-2 border-hotel-gold text-hotel-gold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Nouvelle Évaluation
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center px-6 py-3 font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'border-b-2 border-hotel-gold text-hotel-gold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <History className="mr-2 h-4 w-4" />
                Historique
              </button>
            </nav>
          </div>
        </div>

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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        employeeType === 'employee'
                          ? 'border-hotel-gold bg-hotel-gold/10 text-hotel-gold'
                          : 'border-gray-300 hover:border-gray-400'
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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        employeeType === 'supervisor'
                          ? 'border-hotel-gold bg-hotel-gold/10 text-hotel-gold'
                          : 'border-gray-300 hover:border-gray-400'
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
                  <select
                    value={selectedPosition}
                    onChange={handlePositionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                    disabled={editingEvaluation}
                  >
                    <option value="">-- Choisir un poste --</option>
                    {(employeeType === 'supervisor' ? supervisorPositions : positions).map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(selectedPosition || editingEvaluation) && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                  <div className="xl:sticky xl:top-6">
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
        ) : (
          <HistoryTab 
            evaluations={evaluations}
            githubToken={githubToken}
            onEditEvaluation={handleEditEvaluation}
          />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App