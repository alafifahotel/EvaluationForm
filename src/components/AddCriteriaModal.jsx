import { useState, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'

function AddCriteriaModal({
  isOpen,
  onClose,
  onAdd,
  sectionTitle = 'critère'
}) {
  const [isClosing, setIsClosing] = useState(false)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Reset form when modal opens
      setLabel('')
      setDescription('')
      setError('')
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const generateId = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '_')     // Replace non-alphanumeric with _
      .replace(/^_+|_+$/g, '')         // Trim underscores
      .substring(0, 30)                // Limit length
  }

  const handleAdd = () => {
    if (!label.trim()) {
      setError('Le libellé est requis')
      return
    }

    const newCriterion = {
      id: generateId(label) + '_' + Date.now().toString(36),
      label: label.trim(),
      description: description.trim()
    }

    onAdd(newCriterion)
    handleClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen && !isClosing) return null

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
          onClick={handleClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-200 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold transition-colors duration-200"
              onClick={handleClose}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-hotel-gold/10 sm:mx-0 sm:h-10 sm:w-10">
              <Tag className="h-6 w-6 text-hotel-gold" />
            </div>

            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Ajouter un {sectionTitle}
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="criteria-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Libellé *
                  </label>
                  <input
                    type="text"
                    id="criteria-label"
                    value={label}
                    onChange={(e) => {
                      setLabel(e.target.value)
                      setError('')
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Ponctualité & Assiduité"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="criteria-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="criteria-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                    placeholder="Ex: Respect des horaires, présence régulière"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Description courte qui apparaîtra sous le critère
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              className="inline-flex justify-center items-center w-full sm:w-auto px-4 py-2 text-base font-medium text-white bg-hotel-gold hover:bg-hotel-gold/90 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold sm:text-sm transition-all duration-200"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>

            <button
              type="button"
              className="mt-3 sm:mt-0 inline-flex justify-center items-center w-full sm:w-auto px-4 py-2 bg-white text-base font-medium text-gray-700 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold sm:text-sm transition-all duration-200"
              onClick={handleClose}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCriteriaModal
