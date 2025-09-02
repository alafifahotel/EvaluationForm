import { X } from 'lucide-react'
import PreviewA4 from './PreviewA4'
import { specificCriteria, positions } from '../data/criteriaConfig'

function ViewModal({ isOpen, onClose, evaluation }) {
  if (!isOpen || !evaluation) return null

  // Find the position value from the evaluation's service
  const position = positions.find(p => p.label === evaluation.service)?.value || ''

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-4 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-hotel-dark text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Aperçu de l'évaluation</h2>
            <p className="text-sm text-gray-300 mt-1">
              {evaluation.nom} - {evaluation.service} - {new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content with scroll */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-[210mm] mx-auto">
            <PreviewA4 
              formData={evaluation} 
              position={position}
              isViewMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewModal