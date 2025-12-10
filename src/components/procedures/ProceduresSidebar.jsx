import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, FileText, Plus, Pencil, Trash2 } from 'lucide-react'
import { useProcedures } from '../../contexts/ProceduresContext'
import AddDepartmentModal from './AddDepartmentModal'
import EditDepartmentModal from './EditDepartmentModal'

function ProceduresSidebar({
  departments,
  selectedDepartment,
  selectedProcedure,
  onSelectDepartment,
  onSelectProcedure,
  searchQuery,
  onSearchChange,
  isEditMode
}) {
  const { deleteDepartment } = useProcedures()
  const [expandedDepts, setExpandedDepts] = useState({})
  const [showAddDeptModal, setShowAddDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)

  // Auto-expand departments when searching
  useEffect(() => {
    if (searchQuery) {
      const allExpanded = {}
      departments.forEach(dept => {
        allExpanded[dept.id] = true
      })
      setExpandedDepts(allExpanded)
    }
  }, [searchQuery, departments])

  const toggleDept = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }))
  }

  const handleSelectProcedure = (dept, proc) => {
    onSelectDepartment(dept.id)
    onSelectProcedure(proc.id)
    // Scroll to procedure
    const element = document.getElementById(`proc-${proc.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleDeleteDept = (deptId, deptName) => {
    if (window.confirm(`Supprimer le département "${deptName}" et toutes ses procédures ?`)) {
      deleteDepartment(deptId)
    }
  }

  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Add Department Button (edit mode) */}
      {isEditMode && (
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => setShowAddDeptModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un département
          </button>
        </div>
      )}

      {/* Departments List */}
      <div className="flex-1 overflow-y-auto p-2">
        {departments.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {searchQuery ? 'Aucun résultat' : 'Aucun département'}
          </div>
        ) : (
          <div className="space-y-1">
            {departments.map((dept) => (
              <div key={dept.id}>
                {/* Department Header */}
                <div
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors group ${
                    selectedDepartment === dept.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => toggleDept(dept.id)}
                    className="flex-shrink-0"
                  >
                    {expandedDepts[dept.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className="flex-1 text-sm font-medium truncate"
                    onClick={() => {
                      onSelectDepartment(dept.id)
                      onSelectProcedure(null)
                      toggleDept(dept.id)
                    }}
                    title={dept.name}
                  >
                    {dept.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {dept.procedures.length}
                  </span>

                  {/* Edit/Delete buttons (edit mode) */}
                  {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingDept(dept)
                        }}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDept(dept.id, dept.name)
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Procedures List */}
                {expandedDepts[dept.id] && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {dept.procedures.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => handleSelectProcedure(dept, proc)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                          selectedProcedure === proc.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs truncate" title={proc.title}>
                          {proc.number}. {proc.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
      />

      {editingDept && (
        <EditDepartmentModal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          department={editingDept}
        />
      )}
    </div>
  )
}

export default ProceduresSidebar
