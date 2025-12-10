import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import GitHubService from '../services/githubService'
import {
  getDefaultProcedures,
  generateProcedureId,
  generateDepartmentId,
  countTotalProcedures
} from '../data/proceduresConfig'

const ProceduresContext = createContext()

// Auto-save debounce delay (ms)
const AUTO_SAVE_DELAY = 2000

export const useProcedures = () => {
  const context = useContext(ProceduresContext)
  if (!context) {
    throw new Error('useProcedures must be used within ProceduresProvider')
  }
  return context
}

export function ProceduresProvider({ children, githubToken }) {
  const [data, setData] = useState(null)
  const [dataSha, setDataSha] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const hasLoadedData = useRef(false)
  const autoSaveTimeoutRef = useRef(null)
  const isInitialLoad = useRef(true)

  // Load procedures from GitHub or use defaults
  const loadData = useCallback(async () => {
    if (!githubToken) {
      setData(getDefaultProcedures())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const githubService = new GitHubService(githubToken)
      const result = await githubService.loadProcedures()

      if (result) {
        setData(result.data)
        setDataSha(result.sha)
      } else {
        // Data doesn't exist, migrate from defaults
        const defaultData = getDefaultProcedures()
        const saveResult = await githubService.saveProcedures(defaultData)
        setData(saveResult.data)
        setDataSha(saveResult.sha)
        console.log('Migrated default procedures to GitHub')
      }
    } catch (err) {
      console.error('Failed to load procedures:', err)
      setError(err.message)
      setData(getDefaultProcedures())
    } finally {
      setIsLoading(false)
    }
  }, [githubToken])

  // Save data to GitHub
  const saveData = useCallback(async () => {
    if (!githubToken || !data) {
      return { success: false, error: 'No token or data' }
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const githubService = new GitHubService(githubToken)
      const result = await githubService.saveProcedures(data, dataSha)
      setData(result.data)
      setDataSha(result.sha)
      setHasUnsavedChanges(false)
      setLastSaved(Date.now())
      return { success: true }
    } catch (err) {
      console.error('Failed to save procedures:', err)
      setSaveError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsSaving(false)
    }
  }, [githubToken, data, dataSha])

  // Add a new department
  const addDepartment = useCallback((name) => {
    const newDept = {
      id: generateDepartmentId(),
      name,
      order: data?.departments?.length + 1 || 1,
      procedures: []
    }
    setData(prevData => ({
      ...prevData,
      departments: [...(prevData.departments || []), newDept]
    }))
    setHasUnsavedChanges(true)
    return newDept.id
  }, [data])

  // Update a department
  const updateDepartment = useCallback((deptId, updates) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(dept =>
        dept.id === deptId ? { ...dept, ...updates } : dept
      )
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Delete a department
  const deleteDepartment = useCallback((deptId) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.filter(dept => dept.id !== deptId)
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Add a new procedure to a department
  const addProcedure = useCallback((deptId, procedure) => {
    const newProc = {
      id: generateProcedureId(),
      number: 1,
      ...procedure
    }
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(dept => {
        if (dept.id === deptId) {
          const newNumber = dept.procedures.length + 1
          return {
            ...dept,
            procedures: [...dept.procedures, { ...newProc, number: newNumber }]
          }
        }
        return dept
      })
    }))
    setHasUnsavedChanges(true)
    return newProc.id
  }, [])

  // Update a procedure
  const updateProcedure = useCallback((deptId, procId, updates) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(dept => {
        if (dept.id === deptId) {
          return {
            ...dept,
            procedures: dept.procedures.map(proc =>
              proc.id === procId ? { ...proc, ...updates } : proc
            )
          }
        }
        return dept
      })
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Delete a procedure
  const deleteProcedure = useCallback((deptId, procId) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(dept => {
        if (dept.id === deptId) {
          const filteredProcs = dept.procedures.filter(proc => proc.id !== procId)
          // Renumber remaining procedures
          const renumberedProcs = filteredProcs.map((proc, idx) => ({
            ...proc,
            number: idx + 1
          }))
          return {
            ...dept,
            procedures: renumberedProcs
          }
        }
        return dept
      })
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Reorder procedures within a department
  const reorderProcedures = useCallback((deptId, newOrder) => {
    setData(prevData => ({
      ...prevData,
      departments: prevData.departments.map(dept => {
        if (dept.id === deptId) {
          const renumberedProcs = newOrder.map((proc, idx) => ({
            ...proc,
            number: idx + 1
          }))
          return {
            ...dept,
            procedures: renumberedProcs
          }
        }
        return dept
      })
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Load data when token changes
  useEffect(() => {
    if (hasLoadedData.current && !githubToken) return
    hasLoadedData.current = true
    loadData()
  }, [githubToken, loadData])

  // Mark initial load complete after data is loaded
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  // Auto-save when changes are made (debounced)
  useEffect(() => {
    if (isInitialLoad.current || !githubToken || !hasUnsavedChanges || !data) {
      return
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, githubToken, data, saveData])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !isSaving) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isSaving])

  // Computed statistics
  const totalDepartments = data?.departments?.length || 0
  const totalProcedures = data?.departments ? countTotalProcedures(data.departments) : 0

  const value = {
    // Data
    data,
    departments: data?.departments || [],
    metadata: data?.metadata || {},
    dataSha,

    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    saveError,

    // Statistics
    totalDepartments,
    totalProcedures,

    // Actions
    loadData,
    saveData,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    reorderProcedures
  }

  return (
    <ProceduresContext.Provider value={value}>
      {children}
    </ProceduresContext.Provider>
  )
}

export default ProceduresContext
