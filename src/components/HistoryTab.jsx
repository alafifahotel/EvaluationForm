import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { positions } from '../data/criteriaConfig'
import GitHubService from '../services/githubService'
import ConfirmModal from './ConfirmModal'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'
import LoadingButton from './LoadingButton'
import { Edit, Trash2, Eye, Download, Search, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

function HistoryTab({ evaluations: localEvaluations, githubToken, onEditEvaluation }) {
  const [evaluations, setEvaluations] = useState(localEvaluations || [])
  const [filter, setFilter] = useState({
    service: '',
    dateFrom: '',
    dateTo: '',
    minScore: ''
  })
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, evaluation: null })
  const [actionLoading, setActionLoading] = useState(null)
  const hasLoadedRef = useRef(false)
  const toast = useToast()

  useEffect(() => {
    // Only load if we haven't loaded yet in this component instance
    if (githubToken && !hasLoadedRef.current) {
      loadEvaluationsFromGitHub()
    }
  }, [githubToken])

  const loadEvaluationsFromGitHub = async () => {
    if (!githubToken || hasLoadedRef.current) return
    
    // Set the ref immediately to prevent double execution
    hasLoadedRef.current = true
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
      // Only show toast if we actually loaded evaluations
      if (uniqueEvaluations.length > 0) {
        toast.success(`📂 ${uniqueEvaluations.length} évaluation(s) chargée(s)`)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error)
      toast.error('⚠️ Erreur lors du chargement des évaluations')
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

  const handleEdit = (evaluation) => {
    if (onEditEvaluation) {
      onEditEvaluation(evaluation)
    }
  }

  const handleDelete = async () => {
    const evaluation = deleteModal.evaluation
    if (!evaluation) return

    try {
      // If evaluation has a GitHub path, delete from GitHub
      if (evaluation.githubPath && githubToken) {
        const githubService = new GitHubService(githubToken)
        await githubService.deleteEvaluation(evaluation.githubPath)
      }
      
      // Remove from local state
      setEvaluations(prev => prev.filter(e => 
        e.timestamp !== evaluation.timestamp || e.nom !== evaluation.nom
      ))
      
      toast.success(`🗑️ Évaluation de ${evaluation.nom} supprimée avec succès`)
      setDeleteModal({ isOpen: false, evaluation: null })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('❌ Erreur lors de la suppression de l\'évaluation')
      throw error
    }
  }

  const handleDownload = (evaluation) => {
    // Generate and download PDF for this evaluation
    const fileName = `EVAL_${evaluation.service}_${evaluation.nom}_${format(new Date(evaluation.dateEvaluation), 'yyyy-MM-dd')}.pdf`
    toast.info(`📥 Téléchargement de: ${fileName}`)
  }

  const handleView = (evaluation) => {
    // Open evaluation in preview mode
    console.log('Viewing evaluation:', evaluation)
  }

  const handleRefresh = () => {
    hasLoadedRef.current = false
    loadEvaluationsFromGitHub()
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

      <div className="flex justify-end mb-4">
        <LoadingButton
          onClick={handleRefresh}
          icon={RefreshCw}
          variant="outline"
          size="sm"
          isLoading={loading}
        >
          Rafraîchir
        </LoadingButton>
      </div>

      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" text="Chargement des évaluations..." />
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <EmptyState
          type={filter.service || filter.dateFrom || filter.dateTo || filter.minScore ? 'no-results' : 'no-data'}
          actionText="Créer une évaluation"
          onAction={() => window.location.hash = 'evaluation'}
        />
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
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setActionLoading(`edit-${index}`)
                          handleEdit(evaluation)
                          setActionLoading(null)
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                        disabled={actionLoading === `edit-${index}`}
                      >
                        {actionLoading === `edit-${index}` ? (
                          <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, evaluation })}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleView(evaluation)}
                        className="p-2 text-hotel-gold hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(evaluation)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, evaluation: null })}
        onConfirm={handleDelete}
        title="Supprimer l'évaluation"
        message={`Êtes-vous sûr de vouloir supprimer l'évaluation de ${deleteModal.evaluation?.nom} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  )
}

export default HistoryTab