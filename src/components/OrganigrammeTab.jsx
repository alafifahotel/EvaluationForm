import { useState, useEffect } from 'react'
import { AlertCircle, Lock, Eye, EyeOff, Users, Briefcase, Printer, Edit3, Eye as ViewIcon, Check, Cloud, CloudOff } from 'lucide-react'
import { useOrgChart } from '../contexts/OrgChartContext'
import OrgChart from './orgchart/OrgChart'
import OrgChartPreviewA4 from './orgchart/OrgChartPreviewA4'
import LoadingSpinner from './LoadingSpinner'

// Module-level variable to persist auth across tab switches (resets on page refresh)
let sessionAuthenticated = false

function OrganigrammeTab({ githubToken }) {
  const {
    structure,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    saveError,
    totalEmployees,
    totalPositions
  } = useOrgChart()

  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(sessionAuthenticated)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Edit mode toggle
  const [isEditMode, setIsEditMode] = useState(false)

  // View mode: 'chart' or 'print'
  const [viewMode, setViewMode] = useState('chart')

  // Show "Saved" indicator briefly after save
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)

  // Show saved indicator when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      setShowSavedIndicator(true)
      const timer = setTimeout(() => setShowSavedIndicator(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === 'MANAGEMENT') {
      sessionAuthenticated = true
      setIsAuthenticated(true)
      setPassword('')
      setPasswordError('')
      setIsEditMode(true)
    } else {
      setPasswordError('Mot de passe incorrect')
    }
  }

  const handlePrint = () => {
    const today = new Date()
    const dateStr = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')

    const originalTitle = document.title
    document.title = `Organigramme_Al_Afifa_Hotel_${dateStr}`

    window.print()

    // Restore original title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <LoadingSpinner text="Chargement de l'organigramme..." />
      </div>
    )
  }

  if (!structure) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Impossible de charger l'organigramme</p>
          {error && <p className="text-sm mt-2">{error}</p>}
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
            <h2 className="text-xl font-bold text-gray-800">Organigramme</h2>
            <p className="text-sm text-gray-500 mt-1">
              Structure organisationnelle de l'hôtel
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <Users className="w-4 h-4" />
                {totalEmployees} employés
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <Briefcase className="w-4 h-4" />
                {totalPositions} postes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-hotel-gold text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ViewIcon className="w-4 h-4" />
                Graphique
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                  viewMode === 'print'
                    ? 'bg-hotel-gold text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Printer className="w-4 h-4" />
                Aperçu A4
              </button>
            </div>

            {viewMode === 'print' && (
              <button
                onClick={handlePrint}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            )}

            {/* Edit Mode Toggle */}
            {!isAuthenticated ? (
              <button
                onClick={() => document.getElementById('password-input')?.focus()}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                  isEditMode
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditMode ? 'Mode édition' : 'Modifier'}
              </button>
            )}

            {/* Auto-save Status Indicator */}
            {isEditMode && githubToken && (
              <span className={`text-xs flex items-center gap-1 transition-all duration-300 ${
                saveError ? 'text-red-500' :
                isSaving ? 'text-gray-500' :
                showSavedIndicator ? 'text-green-600' :
                hasUnsavedChanges ? 'text-yellow-600' :
                'text-gray-400'
              }`}>
                {saveError ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Erreur</span>
                  </>
                ) : isSaving ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="hidden sm:inline">Sauvegarde...</span>
                  </>
                ) : showSavedIndicator ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sauvegardé</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">En attente...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Synchronisé</span>
                  </>
                )}
              </span>
            )}

            {/* No token warning */}
            {isEditMode && !githubToken && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Token requis</span>
              </span>
            )}
          </div>
        </div>

        {/* Password Input (shown only when not authenticated and trying to edit) */}
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Pour modifier l'organigramme :</span>
              </div>
              <div className="relative flex-1 max-w-xs">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  className={`w-full px-3 py-2 pr-10 bg-white border rounded-lg focus:outline-none focus:border-hotel-gold text-sm ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-gold/90 transition-colors text-sm"
              >
                Accéder
              </button>
              {passwordError && (
                <span className="text-sm text-red-600">{passwordError}</span>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {viewMode === 'chart' ? (
          <OrgChart
            node={structure}
            isEditMode={isEditMode}
          />
        ) : (
          <OrgChartPreviewA4 structure={structure} />
        )}
      </div>
    </div>
  )
}

export default OrganigrammeTab
