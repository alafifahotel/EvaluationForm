import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import GitHubService from '../services/githubService'
import {
  getDefaultOrganigramme,
  updateNodeInTree,
  addChildToNode,
  removeNodeFromTree,
  reorderChildrenInTree,
  moveNodeBetweenParents,
  generateNodeId,
  countTotalEmployees,
  countTotalPositions
} from '../data/organigrammeConfig'

const OrgChartContext = createContext()

// Auto-save debounce delay (ms)
const AUTO_SAVE_DELAY = 2000

export const useOrgChart = () => {
  const context = useContext(OrgChartContext)
  if (!context) {
    throw new Error('useOrgChart must be used within OrgChartProvider')
  }
  return context
}

export function OrgChartProvider({ children, githubToken }) {
  const [data, setData] = useState(null)
  const [dataSha, setDataSha] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null) // Timestamp of last successful save
  const [saveError, setSaveError] = useState(null) // Last save error
  const hasLoadedData = useRef(false)
  const autoSaveTimeoutRef = useRef(null)
  const isInitialLoad = useRef(true)

  // Load organigramme from GitHub or use defaults
  const loadData = useCallback(async () => {
    if (!githubToken) {
      // No token, use defaults
      setData(getDefaultOrganigramme())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const githubService = new GitHubService(githubToken)
      const result = await githubService.loadOrganigramme()

      if (result) {
        // Data exists in GitHub
        setData(result.data)
        setDataSha(result.sha)
      } else {
        // Data doesn't exist, migrate from defaults
        const defaultData = getDefaultOrganigramme()
        const saveResult = await githubService.saveOrganigramme(defaultData)
        setData(saveResult.data)
        setDataSha(saveResult.sha)
        console.log('Migrated default organigramme to GitHub')
      }
    } catch (err) {
      console.error('Failed to load organigramme:', err)
      setError(err.message)
      // Fall back to defaults on error
      setData(getDefaultOrganigramme())
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
      const result = await githubService.saveOrganigramme(data, dataSha)
      setData(result.data)
      setDataSha(result.sha)
      setHasUnsavedChanges(false)
      setLastSaved(Date.now())
      return { success: true }
    } catch (err) {
      console.error('Failed to save organigramme:', err)
      setSaveError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsSaving(false)
    }
  }, [githubToken, data, dataSha])

  // Update a node in the tree
  const updateNode = useCallback((nodeId, updates) => {
    setData(prevData => ({
      ...prevData,
      structure: updateNodeInTree(prevData.structure, nodeId, updates)
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Add an employee to a node
  const addEmployee = useCallback((nodeId, employeeName) => {
    setData(prevData => ({
      ...prevData,
      structure: updateNodeInTree(prevData.structure, nodeId, (node) => ({
        ...node,
        employees: [...(node.employees || []), employeeName]
      }))
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Remove an employee from a node
  const removeEmployee = useCallback((nodeId, employeeIndex) => {
    setData(prevData => ({
      ...prevData,
      structure: updateNodeInTree(prevData.structure, nodeId, (node) => ({
        ...node,
        employees: node.employees.filter((_, idx) => idx !== employeeIndex)
      }))
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Update an employee name
  const updateEmployee = useCallback((nodeId, employeeIndex, newName) => {
    setData(prevData => ({
      ...prevData,
      structure: updateNodeInTree(prevData.structure, nodeId, (node) => ({
        ...node,
        employees: node.employees.map((emp, idx) => idx === employeeIndex ? newName : emp)
      }))
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Add a new position (child node)
  const addPosition = useCallback((parentId, position, title = '') => {
    const newNode = {
      id: generateNodeId(),
      position,
      title: title || undefined,
      employees: [],
      children: []
    }
    setData(prevData => ({
      ...prevData,
      structure: addChildToNode(prevData.structure, parentId, newNode)
    }))
    setHasUnsavedChanges(true)
    return newNode.id
  }, [])

  // Remove a position (node)
  const removePosition = useCallback((nodeId) => {
    setData(prevData => ({
      ...prevData,
      structure: removeNodeFromTree(prevData.structure, nodeId)
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Reorder children within a parent node
  const reorderChildren = useCallback((parentId, childId, direction) => {
    setData(prevData => ({
      ...prevData,
      structure: reorderChildrenInTree(prevData.structure, parentId, childId, direction)
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Move a service/node from one parent to another
  const moveService = useCallback((nodeId, newParentId) => {
    setData(prevData => ({
      ...prevData,
      structure: moveNodeBetweenParents(prevData.structure, nodeId, newParentId)
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
      // Small delay to ensure we don't trigger auto-save on initial load
      const timer = setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, data])

  // Auto-save when changes are made (debounced)
  useEffect(() => {
    // Don't auto-save during initial load, without token, or if no changes
    if (isInitialLoad.current || !githubToken || !hasUnsavedChanges || !data) {
      return
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveData()
    }, AUTO_SAVE_DELAY)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, githubToken, data, saveData])

  // Warn before leaving with unsaved changes (only if auto-save hasn't completed)
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
  const totalEmployees = data?.structure ? countTotalEmployees(data.structure) : 0
  const totalPositions = data?.structure ? countTotalPositions(data.structure) : 0

  const value = {
    // Data
    data,
    structure: data?.structure || null,
    dataSha,

    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    saveError,

    // Statistics
    totalEmployees,
    totalPositions,

    // Actions
    loadData,
    saveData,
    updateNode,
    addEmployee,
    removeEmployee,
    updateEmployee,
    addPosition,
    removePosition,
    reorderChildren,
    moveService
  }

  return (
    <OrgChartContext.Provider value={value}>
      {children}
    </OrgChartContext.Provider>
  )
}

export default OrgChartContext
