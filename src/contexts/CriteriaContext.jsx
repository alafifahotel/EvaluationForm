import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import GitHubService from '../services/githubService'
import { getDefaultConfig } from '../data/criteriaConfig'

const CriteriaContext = createContext()

export const useCriteria = () => {
  const context = useContext(CriteriaContext)
  if (!context) {
    throw new Error('useCriteria must be used within CriteriaProvider')
  }
  return context
}

export function CriteriaProvider({ children, githubToken }) {
  const [config, setConfig] = useState(null)
  const [configSha, setConfigSha] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const hasLoadedConfig = useRef(false)

  // Load config from GitHub or use defaults
  const loadConfig = useCallback(async () => {
    if (!githubToken) {
      // No token, use defaults
      setConfig(getDefaultConfig())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const githubService = new GitHubService(githubToken)
      const result = await githubService.loadCriteriaConfig()

      if (result) {
        // Config exists in GitHub
        setConfig(result.config)
        setConfigSha(result.sha)
      } else {
        // Config doesn't exist, migrate from defaults
        const defaultConfig = getDefaultConfig()
        const saveResult = await githubService.saveCriteriaConfig(defaultConfig)
        setConfig(saveResult.config)
        setConfigSha(saveResult.sha)
        console.log('Migrated default criteria config to GitHub')
      }
    } catch (err) {
      console.error('Failed to load criteria config:', err)
      setError(err.message)
      // Fall back to defaults on error
      setConfig(getDefaultConfig())
    } finally {
      setIsLoading(false)
    }
  }, [githubToken])

  // Save config to GitHub
  const saveConfig = useCallback(async () => {
    if (!githubToken || !config) {
      return { success: false, error: 'No token or config' }
    }

    setIsSaving(true)
    setError(null)

    try {
      const githubService = new GitHubService(githubToken)
      const result = await githubService.saveCriteriaConfig(config, configSha)
      setConfig(result.config)
      setConfigSha(result.sha)
      setHasUnsavedChanges(false)
      return { success: true }
    } catch (err) {
      console.error('Failed to save criteria config:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsSaving(false)
    }
  }, [githubToken, config, configSha])

  // Update config locally (doesn't save to GitHub)
  const updateConfig = useCallback((updater) => {
    setConfig(prevConfig => {
      const newConfig = typeof updater === 'function' ? updater(prevConfig) : updater
      return newConfig
    })
    setHasUnsavedChanges(true)
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setConfig(getDefaultConfig())
    setHasUnsavedChanges(true)
  }, [])

  // Load config when token changes
  useEffect(() => {
    if (hasLoadedConfig.current && !githubToken) return
    hasLoadedConfig.current = true
    loadConfig()
  }, [githubToken, loadConfig])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Derived data for easy consumption
  const positions = config?.employees?.positions || []
  const supervisorPositions = config?.supervisors?.positions || []
  const commonCriteria = config?.employees?.commonCriteria || []
  const specificCriteria = config?.employees?.specificCriteria || {}
  const technicalCriteria = config?.supervisors?.technicalCriteria || []
  const behavioralCriteria = config?.supervisors?.behavioralCriteria || []
  const employeeScoring = config?.employees?.scoring || { maxPerCriterion: 5, maxCriteria: 6 }
  const supervisorScoring = config?.supervisors?.scoring || { maxPerCriterion: 10, maxCriteria: 6 }

  const value = {
    // Full config
    config,
    configSha,

    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,

    // Actions
    loadConfig,
    saveConfig,
    updateConfig,
    resetToDefaults,

    // Derived data (for easy access)
    positions,
    supervisorPositions,
    commonCriteria,
    specificCriteria,
    technicalCriteria,
    behavioralCriteria,
    employeeScoring,
    supervisorScoring
  }

  return (
    <CriteriaContext.Provider value={value}>
      {children}
    </CriteriaContext.Provider>
  )
}

export default CriteriaContext
