import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { positions } from '../data/criteriaConfig'
import GitHubService from '../services/githubService'
import ConfirmModal from './ConfirmModal'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'
import LoadingButton from './LoadingButton'
import ViewModal from './ViewModal'
import { Edit, Trash2, Eye, Search, Filter, RefreshCw, ChevronDown, ChevronUp, Calendar, Briefcase, Award, X } from 'lucide-react'
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, evaluation: null, isLoading: false, error: null })
  const [viewModal, setViewModal] = useState({ isOpen: false, evaluation: null })
  const [actionLoading, setActionLoading] = useState(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
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

    // Set loading state
    setDeleteModal(prev => ({ ...prev, isLoading: true, error: null }))

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
      // Close modal after successful deletion
      setDeleteModal({ isOpen: false, evaluation: null, isLoading: false, error: null })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      // Show error in modal instead of toast
      const errorMessage = error.message || 'Une erreur est survenue lors de la suppression'
      setDeleteModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `Impossible de supprimer l'évaluation. ${errorMessage}` 
      }))
    }
  }


  const handleView = (evaluation) => {
    setViewModal({ isOpen: true, evaluation })
  }

  const handleRefresh = () => {
    hasLoadedRef.current = false
    loadEvaluationsFromGitHub()
  }

  const hasActiveFilters = () => {
    return filter.service || filter.dateFrom || filter.dateTo || filter.minScore
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filter.service) count++
    if (filter.dateFrom || filter.dateTo) count++
    if (filter.minScore) count++
    return count
  }

  const clearAllFilters = () => {
    setFilter({ service: '', dateFrom: '', dateTo: '', minScore: '' })
  }

  const filteredEvaluations = getFilteredEvaluations()

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Historique des évaluations</h2>

      {/* Enhanced Mobile Filter Section */}
      <div className="mb-6">
        {/* Mobile Filter Toggle Button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-hotel-gold to-yellow-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filtres</span>
              {hasActiveFilters() && (
                <span className="bg-white text-hotel-gold px-2 py-0.5 rounded-full text-xs font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            {filtersExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Filter Content */}
        <div className={`bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
          filtersExpanded ? 'block' : 'hidden sm:block'
        }`}>
          {/* Filter Header - Desktop Only */}
          <div className="hidden sm:flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5 text-hotel-gold" />
              <span>Filtres de recherche</span>
              {hasActiveFilters() && (
                <span className="bg-hotel-gold text-white px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                  {getActiveFilterCount()} actif{getActiveFilterCount() > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>

          {/* Mobile Filter Header */}
          <div className="sm:hidden p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {hasActiveFilters() ? `${getActiveFilterCount()} filtre${getActiveFilterCount() > 1 ? 's' : ''} actif${getActiveFilterCount() > 1 ? 's' : ''}` : 'Aucun filtre actif'}
              </span>
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 font-medium"
                >
                  Tout effacer
                </button>
              )}
            </div>
          </div>

          {/* Filter Fields */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Service Filter */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-hotel-gold transition-colors">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    <Briefcase className="h-4 w-4 text-hotel-gold" />
                    Service
                  </label>
                  <select
                    name="service"
                    value={filter.service}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border-0 bg-gray-50 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-colors text-sm"
                  >
                    <option value="">Tous les services</option>
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.label}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-hotel-gold transition-colors">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    <Calendar className="h-4 w-4 text-hotel-gold" />
                    Période d'évaluation
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Du</label>
                      <input
                        type="date"
                        name="dateFrom"
                        value={filter.dateFrom}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Au</label>
                      <input
                        type="date"
                        name="dateTo"
                        value={filter.dateTo}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Filter */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-hotel-gold transition-colors">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    <Award className="h-4 w-4 text-hotel-gold" />
                    Score minimum
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minScore"
                      min="0"
                      max="100"
                      value={filter.minScore}
                      onChange={handleFilterChange}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-8 bg-gray-50 border-0 rounded-md focus:ring-2 focus:ring-hotel-gold focus:bg-white transition-colors text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
                  {filter.minScore && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-hotel-gold to-yellow-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${filter.minScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Apply Button */}
            <div className="sm:hidden mt-4">
              <button
                onClick={() => setFiltersExpanded(false)}
                className="w-full px-4 py-3 bg-hotel-gold text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pills - Mobile */}
        {hasActiveFilters() && !filtersExpanded && (
          <div className="sm:hidden mt-3 flex flex-wrap gap-2">
            {filter.service && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Briefcase className="h-3 w-3" />
                {filter.service}
                <button onClick={() => setFilter(prev => ({ ...prev, service: '' }))} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filter.dateFrom || filter.dateTo) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <Calendar className="h-3 w-3" />
                {filter.dateFrom && filter.dateTo ? 'Période définie' : filter.dateFrom ? `Depuis ${filter.dateFrom}` : `Jusqu'au ${filter.dateTo}`}
                <button onClick={() => setFilter(prev => ({ ...prev, dateFrom: '', dateTo: '' }))} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filter.minScore && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                <Award className="h-3 w-3" />
                ≥ {filter.minScore}%
                <button onClick={() => setFilter(prev => ({ ...prev, minScore: '' }))} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
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
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
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
                        onClick={() => setDeleteModal({ isOpen: true, evaluation, isLoading: false, error: null })}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, evaluation: null, isLoading: false, error: null })}
        onConfirm={handleDelete}
        title="Supprimer l'évaluation"
        message={`Êtes-vous sûr de vouloir supprimer l'évaluation de ${deleteModal.evaluation?.nom} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        isLoading={deleteModal.isLoading}
        error={deleteModal.error}
      />
      
      <ViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, evaluation: null })}
        evaluation={viewModal.evaluation}
      />
    </div>
  )
}

export default HistoryTab