import { useState, useEffect } from 'react'
import EvaluationForm from './components/EvaluationForm'
import PreviewA4 from './components/PreviewA4'
import HistoryTab from './components/HistoryTab'
import { positions } from './data/criteriaConfig'

function App() {
  const [activeTab, setActiveTab] = useState('evaluation')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [formData, setFormData] = useState({})
  const [githubToken, setGithubToken] = useState('')
  const [evaluations, setEvaluations] = useState([])

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
    setEvaluations([...evaluations, evaluation])
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
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'evaluation'
                    ? 'border-b-2 border-hotel-gold text-hotel-gold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Nouvelle Évaluation
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'border-b-2 border-hotel-gold text-hotel-gold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
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
                      onFormChange={handleFormChange}
                      onSave={handleSaveEvaluation}
                      githubToken={githubToken}
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
          />
        )}
      </div>
    </div>
  )
}

export default App