import { useState, useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'

function EditPositionModal({ isOpen, onClose, onSave, currentPosition, currentTitle }) {
  const [position, setPosition] = useState('')
  const [title, setTitle] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setPosition(currentPosition || '')
      setTitle(currentTitle || '')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, currentPosition, currentTitle])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (position.trim()) {
      onSave(position.trim(), title.trim())
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Modifier le poste</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé du poste <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hotel-gold"
                placeholder="Ex: Chef de partie, Réceptionniste..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de section <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hotel-gold"
                placeholder="Ex: Service de Salle, Bar..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisé pour grouper des postes sous un même département
              </p>
            </div>
          </div>

          {/* Actions */}
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
              disabled={!position.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                position.trim()
                  ? 'bg-hotel-gold text-white hover:bg-hotel-gold/90'
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

export default EditPositionModal
