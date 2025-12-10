import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Target, Users, User, FileText, Clock, ListOrdered } from 'lucide-react'
import { useProcedures } from '../../contexts/ProceduresContext'
import AddProcedureModal from './AddProcedureModal'
import EditProcedureModal from './EditProcedureModal'

function ProceduresList({ departments, selectedDepartment, selectedProcedure, isEditMode }) {
  const { deleteProcedure } = useProcedures()
  const [expandedProcs, setExpandedProcs] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [addToDeptId, setAddToDeptId] = useState(null)
  const [editingProc, setEditingProc] = useState(null)
  const [editingDeptId, setEditingDeptId] = useState(null)
  const containerRef = useRef(null)

  // Auto-expand selected procedure
  useEffect(() => {
    if (selectedProcedure) {
      setExpandedProcs(prev => ({
        ...prev,
        [selectedProcedure]: true
      }))
    }
  }, [selectedProcedure])

  const toggleProc = (procId) => {
    setExpandedProcs(prev => ({
      ...prev,
      [procId]: !prev[procId]
    }))
  }

  const handleDeleteProc = (deptId, procId, procTitle) => {
    if (window.confirm(`Supprimer la procédure "${procTitle}" ?`)) {
      deleteProcedure(deptId, procId)
    }
  }

  const handleAddProcedure = (deptId) => {
    setAddToDeptId(deptId)
    setShowAddModal(true)
  }

  const handleEditProcedure = (deptId, proc) => {
    setEditingDeptId(deptId)
    setEditingProc(proc)
  }

  // Filter to show only selected department or all
  const displayDepartments = selectedDepartment
    ? departments.filter(d => d.id === selectedDepartment)
    : departments

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {displayDepartments.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune procédure à afficher</p>
          </div>
        ) : (
          displayDepartments.map((dept) => (
            <div key={dept.id} className="p-4">
              {/* Department Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                {isEditMode && (
                  <button
                    onClick={() => handleAddProcedure(dept.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une procédure
                  </button>
                )}
              </div>

              {/* Procedures */}
              <div className="space-y-3">
                {dept.procedures.length === 0 ? (
                  <div className="text-center text-gray-400 py-6 text-sm">
                    Aucune procédure dans ce département
                  </div>
                ) : (
                  dept.procedures.map((proc) => (
                    <div
                      key={proc.id}
                      id={`proc-${proc.id}`}
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        selectedProcedure === proc.id
                          ? 'border-indigo-300 bg-indigo-50/30'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Procedure Header */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => toggleProc(proc.id)}
                      >
                        <button className="flex-shrink-0 text-gray-400">
                          {expandedProcs[proc.id] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800">
                            PROCÉDURE {proc.number} : {proc.title}
                          </h4>
                          {!expandedProcs[proc.id] && proc.objective && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                              {proc.objective}
                            </p>
                          )}
                        </div>

                        {/* Edit/Delete buttons (edit mode) */}
                        {isEditMode && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditProcedure(dept.id, proc)
                              }}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProc(dept.id, proc.id, proc.title)
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Procedure Content */}
                      {expandedProcs[proc.id] && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Objective */}
                            {proc.objective && (
                              <div className="flex gap-2">
                                <Target className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase">Objectif</span>
                                  <p className="text-sm text-gray-700 mt-0.5">{proc.objective}</p>
                                </div>
                              </div>
                            )}

                            {/* Scope */}
                            {proc.scope && (
                              <div className="flex gap-2">
                                <Users className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase">Champ d'application</span>
                                  <p className="text-sm text-gray-700 mt-0.5">{proc.scope}</p>
                                </div>
                              </div>
                            )}

                            {/* Responsible */}
                            {proc.responsible && (
                              <div className="flex gap-2">
                                <User className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase">Responsable</span>
                                  <p className="text-sm text-gray-700 mt-0.5">{proc.responsible}</p>
                                </div>
                              </div>
                            )}

                            {/* Documents */}
                            {proc.documents && (
                              <div className="flex gap-2">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase">Documents associés</span>
                                  <p className="text-sm text-gray-700 mt-0.5">{proc.documents}</p>
                                </div>
                              </div>
                            )}

                            {/* Frequency */}
                            {proc.frequency && (
                              <div className="flex gap-2">
                                <Clock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase">Fréquence</span>
                                  <p className="text-sm text-gray-700 mt-0.5">{proc.frequency}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Steps */}
                          {proc.steps && proc.steps.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ListOrdered className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-500 uppercase">Étapes à suivre</span>
                              </div>
                              <ol className="space-y-2 ml-1">
                                {proc.steps.map((step, idx) => (
                                  <li key={idx} className="flex gap-3 text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                                      {idx + 1}
                                    </span>
                                    <span className="text-gray-700 pt-0.5">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AddProcedureModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setAddToDeptId(null)
        }}
        departmentId={addToDeptId}
      />

      {editingProc && (
        <EditProcedureModal
          isOpen={!!editingProc}
          onClose={() => {
            setEditingProc(null)
            setEditingDeptId(null)
          }}
          procedure={editingProc}
          departmentId={editingDeptId}
        />
      )}
    </div>
  )
}

export default ProceduresList
