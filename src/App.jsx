import { useState, useEffect } from 'react'
import EvaluationForm from './components/EvaluationForm'
import PreviewA4 from './components/PreviewA4'
import HistoryTab from './components/HistoryTab'
import { positions } from './data/criteriaConfig'
import { FileEdit, History } from 'lucide-react'

function App() {
  // Get initial tab from URL hash or default to 'evaluation'
  const getInitialTab = () => {
    const hash = window.location.hash.slice(1)
    return hash === 'history' ? 'history' : 'evaluation'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
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
      }
    }
  }, [])

  const handlePositionChange = (e) => {
    setSelectedPosition(e.target.value)
    setFormData({
      service: positions.find(p => p.value === e.target.value)?.label || '',
      poste: positions.find(p => p.value === e.target.value)?.label || ''
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
    setSelectedPosition(positions.find(p => p.label === evaluation.service)?.value || '')
    setFormData(evaluation)
    setActiveTab('evaluation')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-hotel-dark text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-hotel-gold">
            Al Afifa Hotel - Système d'Évaluation
          </h1>
          <p className="text-gray-300 mt-2">Fiche d'évaluation du personnel</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-6">
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner le poste à évaluer
                </label>
                <select
                  value={selectedPosition}
                  onChange={handlePositionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                >
                  <option value="">-- Choisir un poste --</option>
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPosition && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <EvaluationForm
                      position={selectedPosition}
                      positionLabel={positions.find(p => p.value === selectedPosition)?.label || ''}
                      onFormChange={handleFormChange}
                      onSave={handleSaveEvaluation}
                      githubToken={githubToken}
                      initialData={editingEvaluation}
                      isEditing={!!editingEvaluation}
                    />
                  </div>
                  <div className="lg:sticky lg:top-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Aperçu du document
                    </h3>
                    <div className="border rounded-lg overflow-auto max-h-screen">
                      <PreviewA4 
                        formData={formData} 
                        position={selectedPosition}
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

export default App