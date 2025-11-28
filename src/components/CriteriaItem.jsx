import { useState } from 'react'
import { Edit2, Trash2, Check, X, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function CriteriaItem({
  criterion,
  onUpdate,
  onDelete,
  isDeleting = false,
  maxScore = 5
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(criterion.label)
  const [editDescription, setEditDescription] = useState(criterion.description || '')
  const [error, setError] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: criterion.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  const handleSave = () => {
    if (!editLabel.trim()) {
      setError('Le libellé est requis')
      return
    }

    onUpdate({
      ...criterion,
      label: editLabel.trim(),
      description: editDescription.trim()
    })
    setIsEditing(false)
    setError('')
  }

  const handleCancel = () => {
    setEditLabel(criterion.label)
    setEditDescription(criterion.description || '')
    setIsEditing(false)
    setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 border-2 border-hotel-gold shadow-md">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => {
                setEditLabel(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du critère"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold"
              placeholder="Description du critère (optionnel)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm text-white bg-hotel-gold hover:bg-hotel-gold/90 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg p-3 border border-gray-200 hover:border-hotel-gold/50 hover:shadow-md transition-all duration-200 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mt-1 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800 truncate">
              {criterion.label}
            </h4>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              0-{maxScore} pts
            </span>
          </div>
          {criterion.description && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {criterion.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-hotel-gold hover:bg-hotel-gold/10 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(criterion)}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            {isDeleting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CriteriaItem
