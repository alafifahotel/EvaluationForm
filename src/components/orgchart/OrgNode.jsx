import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, X, Check, UserPlus, Users, Pencil } from 'lucide-react'
import { useOrgChart } from '../../contexts/OrgChartContext'
import AddPositionModal from './AddPositionModal'
import EditPositionModal from './EditPositionModal'
import { getDepartmentColor, findDepartmentId, getAllDepartmentIds } from '../../data/departmentColors'

function OrgNode({ node, isEditMode, isRoot = false, level = 0, departmentId = null, parentId = null, siblingIndex = 0, totalSiblings = 1 }) {
  const { addEmployee, removeEmployee, updateEmployee, addPosition, removePosition, updateNode, reorderChildren, structure } = useOrgChart()

  const [isExpanded, setIsExpanded] = useState(true)
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [showAddPositionModal, setShowAddPositionModal] = useState(false)
  const [showEditPositionModal, setShowEditPositionModal] = useState(false)

  const hasChildren = node.children && node.children.length > 0

  // Only level 1 nodes with titles are actual departments
  // Sub-sections (level 2+ with titles like "Réception", "Service de Salle") inherit parent department
  const isActualDepartment = level === 1 && node.title
  const currentDepartmentId = isActualDepartment ? node.id : departmentId

  // Get all department IDs for color assignment (only level 1 departments)
  const allDepartments = structure ? getAllDepartmentIds(structure) : []

  // Get department color
  const deptColor = currentDepartmentId ? getDepartmentColor(currentDepartmentId, allDepartments) : null

  // Calculate depth within department (0 = department head, increases with each level)
  // Only reset to 0 for actual department heads (level 1)
  const depthInDepartment = isActualDepartment ? 0 : (level > 1 ? level - 1 : 0)

  // Check if this is a sub-section head (has title but not a department)
  const isSubSection = node.title && level > 1

  // Get styles based on level and department color with shade variations
  const getNodeStyles = () => {
    if (isRoot) {
      return {
        container: {
          background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
          borderLeft: '4px solid #D4AF37'
        },
        titleColor: '#D4AF37',
        positionColor: '#ffffff',
        employeesColor: '#d1d5db',
        badgeBg: 'rgba(255, 255, 255, 0.2)',
        badgeText: '#ffffff',
        employeeBg: 'rgba(255, 255, 255, 0.1)',
        employeeBorder: 'transparent'
      }
    }

    if (deptColor) {
      // Calculate border opacity based on depth (deeper = slightly lighter)
      // Department head: 100%, sub-section: 80%, deeper: 60%
      const borderOpacity = isActualDepartment ? 1 : isSubSection ? 0.8 : Math.max(0.5, 1 - (depthInDepartment * 0.15))

      // Background varies by role in department
      let backgroundColor = '#ffffff'
      if (isActualDepartment) {
        // Department head: light colored background
        backgroundColor = deptColor.light
      } else if (isSubSection) {
        // Sub-section head: slightly tinted background
        backgroundColor = `${deptColor.primary}0A`
      }

      return {
        container: {
          backgroundColor,
          borderLeft: '4px solid',
          borderLeftColor: `${deptColor.primary}${Math.round(borderOpacity * 255).toString(16).padStart(2, '0')}`
        },
        titleColor: deptColor.primary,
        positionColor: isActualDepartment ? deptColor.text : '#374151',
        employeesColor: '#4b5563',
        badgeBg: `${deptColor.primary}15`,
        badgeText: deptColor.primary,
        employeeBg: '#ffffff',
        employeeBorder: '#e5e7eb',
        accentColor: deptColor.accent
      }
    }

    // Fallback for nodes without department
    return {
      container: {
        backgroundColor: '#f9fafb',
        borderLeft: '4px solid #d1d5db'
      },
      titleColor: '#6b7280',
      positionColor: '#374151',
      employeesColor: '#4b5563',
      badgeBg: '#f3f4f6',
      badgeText: '#4b5563',
      employeeBg: '#ffffff',
      employeeBorder: '#e5e7eb'
    }
  }

  const styles = getNodeStyles()

  const handleStartEditEmployee = (index) => {
    setEditingEmployeeIndex(index)
    setEditValue(node.employees[index])
  }

  const handleSaveEmployee = () => {
    if (editValue.trim()) {
      updateEmployee(node.id, editingEmployeeIndex, editValue.trim())
    }
    setEditingEmployeeIndex(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingEmployeeIndex(null)
    setEditValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEmployee()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      addEmployee(node.id, newEmployeeName.trim())
      setNewEmployeeName('')
      setIsAddingEmployee(false)
    }
  }

  const handleAddEmployeeKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddEmployee()
    } else if (e.key === 'Escape') {
      setIsAddingEmployee(false)
      setNewEmployeeName('')
    }
  }

  const handleAddPosition = (position, title) => {
    addPosition(node.id, position, title)
    setShowAddPositionModal(false)
  }

  const handleRemovePosition = () => {
    if (window.confirm(`Supprimer "${node.position}" et tous ses sous-postes ?`)) {
      removePosition(node.id)
    }
  }

  const handleEditPosition = (position, title) => {
    updateNode(node.id, { position, title: title || undefined })
    setShowEditPositionModal(false)
  }

  return (
    <div className={`${level > 0 ? 'ml-4 sm:ml-6' : ''}`}>
      {/* Node Card */}
      <div
        className="rounded-lg shadow-sm mb-2 overflow-hidden"
        style={styles.container}
      >
        {/* Header Row */}
        <div className="flex items-center gap-2 p-3">
          {/* Expand/Collapse Toggle */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-black/5"
              style={{ color: isRoot ? '#D4AF37' : styles.titleColor }}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : (
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isRoot ? '#D4AF37' : (deptColor?.primary || '#d1d5db') }}
              />
            </div>
          )}

          {/* Position Info */}
          <div className="flex-1 min-w-0">
            {node.title && (
              <div
                className="text-xs uppercase tracking-wide font-semibold"
                style={{ color: styles.titleColor }}
              >
                {node.title}
              </div>
            )}
            <div
              className="font-medium"
              style={{ color: styles.positionColor }}
            >
              {node.position}
            </div>
          </div>

          {/* Employee Count Badge */}
          {node.employees && node.employees.length > 0 && (
            <div
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: styles.badgeBg, color: styles.badgeText }}
            >
              <Users className="w-3 h-3" />
              {node.employees.length}
            </div>
          )}

          {/* Reorder Buttons (only for departments - level 1) */}
          {isEditMode && level === 1 && parentId && (
            <div className="flex-shrink-0 flex flex-col -my-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (siblingIndex > 0) {
                    reorderChildren(parentId, node.id, 'up')
                  }
                }}
                disabled={siblingIndex === 0}
                className={`w-5 h-4 flex items-center justify-center rounded-t transition-colors ${
                  siblingIndex === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Monter"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (siblingIndex < totalSiblings - 1) {
                    reorderChildren(parentId, node.id, 'down')
                  }
                }}
                disabled={siblingIndex === totalSiblings - 1}
                className={`w-5 h-4 flex items-center justify-center rounded-b transition-colors ${
                  siblingIndex === totalSiblings - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Descendre"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Edit & Delete Position Buttons (not for root) */}
          {isEditMode && !isRoot && (
            <>
              <button
                onClick={() => setShowEditPositionModal(true)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded transition-colors"
                title="Modifier ce poste"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemovePosition}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Supprimer ce poste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Employees Section */}
        {(node.employees?.length > 0 || isEditMode) && (
          <div className={`px-3 pb-3 pt-0 ${hasChildren ? 'border-t border-gray-200/50' : ''}`}>
            <div className="flex flex-wrap gap-2 mt-2">
              {node.employees?.map((employee, index) => (
                <div key={index} className="group">
                  {editingEmployeeIndex === index && isEditMode ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-hotel-gold"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEmployee}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => isEditMode && handleStartEditEmployee(index)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm border ${
                        isEditMode ? 'cursor-pointer hover:border-current' : ''
                      }`}
                      style={{
                        color: styles.employeesColor,
                        backgroundColor: styles.employeeBg,
                        borderColor: styles.employeeBorder
                      }}
                    >
                      {employee}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEmployee(node.id, index)
                          }}
                          className="ml-1 text-red-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              ))}

              {/* Add Employee Input */}
              {isAddingEmployee && isEditMode && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    onKeyDown={handleAddEmployeeKeyDown}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-hotel-gold"
                    placeholder="Nom"
                    autoFocus
                  />
                  <button
                    onClick={handleAddEmployee}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingEmployee(false)
                      setNewEmployeeName('')
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Add Buttons */}
              {isEditMode && !isAddingEmployee && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsAddingEmployee(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border hover:opacity-80"
                    style={{
                      color: isRoot ? '#D4AF37' : (deptColor?.primary || '#2563EB'),
                      borderColor: isRoot ? 'rgba(212, 175, 55, 0.5)' : (deptColor?.primary || '#2563EB') + '40'
                    }}
                  >
                    <UserPlus className="w-3 h-3" />
                    Employé
                  </button>
                  <button
                    onClick={() => setShowAddPositionModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border hover:opacity-80"
                    style={{
                      color: isRoot ? '#D4AF37' : (deptColor?.primary || '#16A34A'),
                      borderColor: isRoot ? 'rgba(212, 175, 55, 0.5)' : (deptColor?.primary || '#16A34A') + '40'
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Poste
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <OrgNode
              key={child.id}
              node={child}
              isEditMode={isEditMode}
              level={level + 1}
              departmentId={currentDepartmentId}
              parentId={node.id}
              siblingIndex={index}
              totalSiblings={node.children.length}
            />
          ))}
        </div>
      )}

      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={showAddPositionModal}
        onClose={() => setShowAddPositionModal(false)}
        onAdd={handleAddPosition}
        parentPosition={node.position}
      />

      {/* Edit Position Modal */}
      <EditPositionModal
        isOpen={showEditPositionModal}
        onClose={() => setShowEditPositionModal(false)}
        onSave={handleEditPosition}
        currentPosition={node.position}
        currentTitle={node.title}
      />
    </div>
  )
}

export default OrgNode
