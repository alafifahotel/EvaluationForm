import { useState, useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'
import { useProcedures } from '../../contexts/ProceduresContext'

function EditDepartmentModal({ isOpen, onClose, department }) {
  const { updateDepartment } = useProcedures()
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && department) {
      setName(department.name)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, department])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && department) {
      updateDepartment(department.id, { name: name.trim().toUpperCase() })
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Modifier le département</h3>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du département <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                name.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditDepartmentModal
