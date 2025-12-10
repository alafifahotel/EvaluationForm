import { useState, useEffect, useRef } from 'react'
import { X, Check, Plus, Trash2 } from 'lucide-react'
import { useProcedures } from '../../contexts/ProceduresContext'

function EditProcedureModal({ isOpen, onClose, procedure, departmentId }) {
  const { updateProcedure } = useProcedures()
  const [form, setForm] = useState({
    title: '',
    objective: '',
    scope: '',
    responsible: '',
    documents: '',
    frequency: '',
    steps: ['']
  })
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && procedure) {
      setForm({
        title: procedure.title || '',
        objective: procedure.objective || '',
        scope: procedure.scope || '',
        responsible: procedure.responsible || '',
        documents: procedure.documents || '',
        frequency: procedure.frequency || '',
        steps: procedure.steps?.length > 0 ? [...procedure.steps] : ['']
      })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, procedure])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (idx, value) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === idx ? value : s)
    }))
  }

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, ''] }))
  }

  const removeStep = (idx) => {
    if (form.steps.length > 1) {
      setForm(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== idx)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.title.trim() && departmentId && procedure) {
      const updates = {
        title: form.title.trim().toUpperCase(),
        objective: form.objective.trim(),
        scope: form.scope.trim(),
        responsible: form.responsible.trim(),
        documents: form.documents.trim(),
        frequency: form.frequency.trim(),
        steps: form.steps.filter(s => s.trim()).map(s => s.trim())
      }
      updateProcedure(departmentId, procedure.id, updates)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Modifier la procédure</h3>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectif</label>
              <textarea
                value={form.objective}
                onChange={(e) => handleChange('objective', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Champ d'application</label>
                <input
                  type="text"
                  value={form.scope}
                  onChange={(e) => handleChange('scope', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Responsible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input
                  type="text"
                  value={form.responsible}
                  onChange={(e) => handleChange('responsible', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documents associés</label>
                <input
                  type="text"
                  value={form.documents}
                  onChange={(e) => handleChange('documents', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <input
                  type="text"
                  value={form.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Étapes à suivre</label>
              <div className="space-y-2">
                {form.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      disabled={form.steps.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addStep}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter une étape
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!form.title.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                form.title.trim()
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

export default EditProcedureModal
