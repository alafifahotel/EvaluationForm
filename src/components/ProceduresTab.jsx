import { useState, useEffect } from 'react'
import { Book, Eye, Printer, Lock, Unlock, Cloud, CloudOff, Check, AlertCircle, FileText, Building2 } from 'lucide-react'
import { useProcedures } from '../contexts/ProceduresContext'
import ProceduresSidebar from './procedures/ProceduresSidebar'
import ProceduresList from './procedures/ProceduresList'
import ProceduresPreviewA4 from './procedures/ProceduresPreviewA4'
import LoadingSpinner from './LoadingSpinner'

// Session-level authentication (persists across tab switches within same session)
let sessionAuthenticated = false

function ProceduresTab({ githubToken }) {
  const {
    departments,
    metadata,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    saveError,
    totalDepartments,
    totalProcedures
  } = useProcedures()

  const [isEditMode, setIsEditMode] = useState(false)
  const [viewMode, setViewMode] = useState('browse') // 'browse' or 'print'
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Check session auth on mount
  useEffect(() => {
    if (sessionAuthenticated) {
      setIsEditMode(true)
    }
  }, [])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === 'MANAGEMENT') {
      setIsEditMode(true)
      sessionAuthenticated = true
      setShowPasswordForm(false)
      setPassword('')
      setPasswordError('')
    } else {
      setPasswordError('Mot de passe incorrect')
    }
  }

  const handleExitEditMode = () => {
    setIsEditMode(false)
    sessionAuthenticated = false
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter departments and procedures based on search
  const filteredDepartments = departments.map(dept => {
    if (!searchQuery) return dept

    const query = searchQuery.toLowerCase()
    const matchingProcedures = dept.procedures.filter(proc =>
      proc.title.toLowerCase().includes(query) ||
      proc.objective?.toLowerCase().includes(query) ||
      proc.steps?.some(step => step.toLowerCase().includes(query))
    )

    if (dept.name.toLowerCase().includes(query) || matchingProcedures.length > 0) {
      return {
        ...dept,
        procedures: matchingProcedures.length > 0 ? matchingProcedures : dept.procedures
      }
    }
    return null
  }).filter(Boolean)

  if (isLoading) {
    return <LoadingSpinner text="Chargement des procédures..." />
  }

  if (error && !departments.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">Erreur lors du chargement des procédures</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Stats */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Manuel de Procédures</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {totalDepartments} départements
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {totalProcedures} procédures
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('browse')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'browse'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Consulter</span>
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'print'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer</span>
              </button>
            </div>

            {/* Print Button (only in print mode) */}
            {viewMode === 'print' && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            )}

            {/* Edit Mode Toggle */}
            {!isEditMode ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <button
                onClick={handleExitEditMode}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                Quitter édition
              </button>
            )}

            {/* Save Status */}
            {githubToken && isEditMode && (
              <div className="flex items-center gap-1.5 text-sm">
                {isSaving ? (
                  <>
                    <Cloud className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className="text-blue-600">Sauvegarde...</span>
                  </>
                ) : saveError ? (
                  <>
                    <CloudOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Erreur</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Cloud className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600">Non sauvegardé</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Sauvegardé</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Password Form */}
        {showPasswordForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handlePasswordSubmit} className="flex items-center gap-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPassword('')
                  setPasswordError('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              {passwordError && (
                <span className="text-red-500 text-sm">{passwordError}</span>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'browse' ? (
        <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
          {/* Sidebar */}
          <ProceduresSidebar
            departments={filteredDepartments}
            selectedDepartment={selectedDepartment}
            selectedProcedure={selectedProcedure}
            onSelectDepartment={setSelectedDepartment}
            onSelectProcedure={setSelectedProcedure}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isEditMode={isEditMode}
          />

          {/* Main Content */}
          <div className="flex-1">
            <ProceduresList
              departments={filteredDepartments}
              selectedDepartment={selectedDepartment}
              selectedProcedure={selectedProcedure}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      ) : (
        <ProceduresPreviewA4
          departments={departments}
          metadata={metadata}
        />
      )}
    </div>
  )
}

export default ProceduresTab
