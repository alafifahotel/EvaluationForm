import { useState } from 'react'
import { Plus, Trash2, Briefcase, X, Check, AlertTriangle } from 'lucide-react'
import CustomDropdown from './CustomDropdown'
import ConfirmModal from './ConfirmModal'

function PositionManager({
  positions = [],
  selectedPosition,
  onSelectPosition,
  onAddPosition,
  onDeletePosition,
  label = "Position",
  placeholder = "-- Sélectionner un poste --"
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [newPositionLabel, setNewPositionLabel] = useState('')
  const [addError, setAddError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const generateValue = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 30)
  }

  const handleAddPosition = () => {
    if (!newPositionLabel.trim()) {
      setAddError('Le nom du poste est requis')
      return
    }

    // Check for duplicates
    const value = generateValue(newPositionLabel)
    if (positions.some(p => p.value === value || p.label.toLowerCase() === newPositionLabel.toLowerCase())) {
      setAddError('Ce poste existe déjà')
      return
    }

    const newPosition = {
      value: value + '_' + Date.now().toString(36),
      label: newPositionLabel.trim()
    }

    onAddPosition(newPosition)
    setNewPositionLabel('')
    setIsAdding(false)
    setAddError('')

    // Select the new position
    onSelectPosition({ target: { value: newPosition.value } })
  }

  const handleDeletePosition = () => {
    if (deleteTarget) {
      onDeletePosition(deleteTarget.value)
      setDeleteTarget(null)

      // If we deleted the selected position, clear selection
      if (selectedPosition === deleteTarget.value) {
        onSelectPosition({ target: { value: '' } })
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPosition()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewPositionLabel('')
      setAddError('')
    }
  }

  const canDelete = positions.length > 1
  const selectedPos = positions.find(p => p.value === selectedPosition)

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-5 h-5 text-hotel-gold" />
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {positions.length} poste{positions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Position Dropdown */}
        <div className="flex-1">
          <CustomDropdown
            name="position"
            value={selectedPosition}
            onChange={onSelectPosition}
            options={positions}
            placeholder={placeholder}
            searchable={true}
            icon={Briefcase}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-gold/90 transition-colors flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          ) : null}

          {selectedPosition && canDelete && (
            <button
              onClick={() => setDeleteTarget(selectedPos)}
              className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-sm"
              title="Supprimer ce poste"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Position Form */}
      {isAdding && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveau poste
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPositionLabel}
              onChange={(e) => {
                setNewPositionLabel(e.target.value)
                setAddError('')
              }}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold ${
                addError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Réception"
              autoFocus
            />
            <button
              onClick={handleAddPosition}
              className="px-3 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-gold/90 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewPositionLabel('')
                setAddError('')
              }}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {addError && (
            <p className="mt-1 text-sm text-red-600">{addError}</p>
          )}
        </div>
      )}

      {/* Delete Position Warning */}
      {!canDelete && positions.length === 1 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Au moins un poste doit être défini</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePosition}
        title="Supprimer le poste"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.label}" ? Les critères spécifiques associés seront également supprimés.`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  )
}

export default PositionManager
