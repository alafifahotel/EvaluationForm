import { X, Printer } from 'lucide-react'
import PreviewA4 from './PreviewA4'
import { specificCriteria, positions } from '../data/criteriaConfig'
import { useRef } from 'react'

function ViewModal({ isOpen, onClose, evaluation }) {
  const printRef = useRef(null)
  
  if (!isOpen || !evaluation) return null

  // Find the position value from the evaluation's service
  const position = positions.find(p => p.label === evaluation.service)?.value || ''
  
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print:static print:inset-auto print:overflow-visible print:z-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity print:hidden"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 m-2 sm:m-4 md:m-8 bg-white rounded-lg shadow-2xl overflow-auto print:static print:inset-auto print:bg-transparent print:shadow-none print:rounded-none print:overflow-visible print:m-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-hotel-dark text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Aperçu de l'évaluation</h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-1">
              {evaluation.nom} - {evaluation.service} - {new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
              title="Imprimer"
            >
              <Printer className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-gray-100 p-3 sm:p-6 md:p-8 print:p-0 print:bg-white print:overflow-visible print:flex print:items-center print:justify-center print:min-h-screen">
          <div className="w-full max-w-[210mm] mx-auto print:max-w-none print:mx-auto print:my-0" ref={printRef}>
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