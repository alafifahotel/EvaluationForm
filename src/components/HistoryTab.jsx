import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { positions } from '../data/criteriaConfig'
import GitHubService from '../services/githubService'

function HistoryTab({ evaluations: localEvaluations, githubToken }) {
  const [evaluations, setEvaluations] = useState(localEvaluations || [])
  const [filter, setFilter] = useState({
    service: '',
    dateFrom: '',
    dateTo: '',
    minScore: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEvaluationsFromGitHub()
  }, [githubToken])

  const loadEvaluationsFromGitHub = async () => {
    if (!githubToken) return
    
    setLoading(true)
    try {
      const githubService = new GitHubService(githubToken)
      const githubEvaluations = await githubService.loadEvaluations()
      
      // Combine GitHub evaluations with local ones
      const allEvaluations = [...(localEvaluations || []), ...githubEvaluations]
      
      // Remove duplicates based on timestamp
      const uniqueEvaluations = allEvaluations.filter((evaluation, index, self) =>
        index === self.findIndex(e => e.timestamp === evaluation.timestamp)
      )
      
      setEvaluations(uniqueEvaluations)
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error)
      // Fall back to local evaluations
      setEvaluations(localEvaluations || [])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getFilteredEvaluations = () => {
    return evaluations.filter(evaluation => {
      if (filter.service && evaluation.service !== filter.service) return false
      if (filter.dateFrom && new Date(evaluation.dateEvaluation) < new Date(filter.dateFrom)) return false
      if (filter.dateTo && new Date(evaluation.dateEvaluation) > new Date(filter.dateTo)) return false
      if (filter.minScore && evaluation.percentage < parseFloat(filter.minScore)) return false
      return true
    })
  }

  const handleDownload = (evaluation) => {
    // Generate and download PDF for this evaluation
    const fileName = `EVAL_${evaluation.service}_${evaluation.nom}_${format(new Date(evaluation.dateEvaluation), 'yyyy-MM-dd')}.pdf`
    alert(`Téléchargement de: ${fileName}`)
  }

  const handleView = (evaluation) => {
    // Open evaluation in preview mode
    console.log('Viewing evaluation:', evaluation)
  }

  const filteredEvaluations = getFilteredEvaluations()

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Historique des évaluations</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtres</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              name="service"
              value={filter.service}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
            >
              <option value="">Tous les services</option>
              {positions.map(pos => (
                <option key={pos.value} value={pos.label}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              name="dateFrom"
              value={filter.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              name="dateTo"
              value={filter.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score minimum (%)</label>
            <input
              type="number"
              name="minScore"
              min="0"
              max="100"
              value={filter.minScore}
              onChange={handleFilterChange}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des évaluations...</p>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune évaluation trouvée</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appréciation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évaluateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(evaluation.dateEvaluation || evaluation.timestamp), 'dd/MM/yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{evaluation.nom}</div>
                      <div className="text-sm text-gray-500">Mat: {evaluation.matricule}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.service || evaluation.poste}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{evaluation.totalScore}/{evaluation.maxScore || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{evaluation.percentage}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      evaluation.appreciation === 'Excellent' ? 'bg-green-100 text-green-800' :
                      evaluation.appreciation === 'Très Bon' ? 'bg-blue-100 text-blue-800' :
                      evaluation.appreciation === 'Bon' ? 'bg-indigo-100 text-indigo-800' :
                      evaluation.appreciation === 'À améliorer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {evaluation.appreciation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.evaluateurNom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(evaluation)}
                      className="text-hotel-gold hover:text-yellow-600 mr-4"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => handleDownload(evaluation)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HistoryTab