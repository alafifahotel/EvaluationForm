import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import CriteriaItem from './CriteriaItem'
import AddCriteriaModal from './AddCriteriaModal'
import ConfirmModal from './ConfirmModal'

function CriteriaEditor({
  title,
  icon: Icon,
  criteria = [],
  onUpdate,
  maxCriteria = 6,
  maxScore = 5,
  emptyMessage = 'Aucun critère défini'
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAddCriterion = (newCriterion) => {
    onUpdate([...criteria, newCriterion])
  }

  const handleUpdateCriterion = (updatedCriterion) => {
    onUpdate(criteria.map(c =>
      c.id === updatedCriterion.id ? updatedCriterion : c
    ))
  }

  const handleDeleteCriterion = () => {
    if (deleteTarget) {
      onUpdate(criteria.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    }
  }

  const isAtMax = criteria.length >= maxCriteria
  const count = criteria.length

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 bg-hotel-gold rounded-lg">
              <Icon className="h-4 w-4 text-white" />
            </div>
          )}
          <h3 className="text-base font-bold text-gray-800">
            {title}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isAtMax
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {count}/{maxCriteria}
          </span>
        </div>
      </div>

      {/* Criteria List */}
      {criteria.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {criteria.map((criterion) => (
            <CriteriaItem
              key={criterion.id}
              criterion={criterion}
              onUpdate={handleUpdateCriterion}
              onDelete={(c) => setDeleteTarget(c)}
              maxScore={maxScore}
            />
          ))}
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        disabled={isAtMax}
        className={`w-full py-2.5 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-2 ${
          isAtMax
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            : 'border-hotel-gold/30 text-hotel-gold hover:border-hotel-gold hover:bg-hotel-gold/5'
        }`}
      >
        <Plus className="w-4 h-4" />
        {isAtMax ? 'Maximum atteint' : 'Ajouter un critère'}
      </button>

      {/* Add Modal */}
      <AddCriteriaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCriterion}
        sectionTitle="critère"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCriterion}
        title="Supprimer le critère"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.label}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  )
}

export default CriteriaEditor
