import { X, Printer } from 'lucide-react'
import PreviewA4 from './PreviewA4'
import { specificCriteria, positions, supervisorPositions } from '../data/criteriaConfig'
import { useRef, useEffect } from 'react'

function ViewModal({ isOpen, onClose, evaluation }) {
  const printRef = useRef(null)
  
  // Add print styles when modal opens
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style')
      style.id = 'view-modal-print-styles'
      style.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html, #root {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-a4-container {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
          }
          .print-a4-container .print-content {
            width: 100% !important;
            height: auto !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 20mm 25mm 5mm 25mm !important;
            box-sizing: border-box !important;
            transform: none !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          /* Employee evaluation */
          .print-a4-container .print-content[data-employee-type="employee"] table {
            width: 100% !important;
            table-layout: fixed !important;
          }
          .print-a4-container .print-content[data-employee-type="employee"] table th:nth-child(1) {
            width: 25% !important;
          }
          .print-a4-container .print-content[data-employee-type="employee"] table th:nth-child(2) {
            width: 55% !important;
          }
          .print-a4-container .print-content[data-employee-type="employee"] table th:nth-child(3) {
            width: 20% !important;
          }
          /* Supervisor evaluation */
          .print-a4-container .print-content[data-employee-type="supervisor"] table {
            width: 100% !important;
            table-layout: fixed !important;
          }
        }
        @page {
          size: auto;
          margin: 10mm;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        const existingStyle = document.getElementById('view-modal-print-styles')
        if (existingStyle) {
          document.head.removeChild(existingStyle)
        }
      }
    }
  }, [isOpen])
  
  if (!isOpen || !evaluation) return null

  // Determine employee type and find the position value
  const employeeType = evaluation.employeeType || 'employee'
  const positionsList = employeeType === 'supervisor' ? supervisorPositions : positions
  const position = positionsList.find(p => p.label === evaluation.service)?.value || ''
  
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Print-only content */}
      <div className="hidden print:block print:fixed print:top-0 print:left-0 print:right-0 print:m-0 print:p-0 print-a4-container" style={{ pageBreakBefore: 'avoid' }}>
        <PreviewA4 
          formData={evaluation} 
          position={position}
          employeeType={employeeType}
          isViewMode={true}
        />
      </div>
      
      {/* Screen-only modal */}
      <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="fixed inset-0 m-2 sm:m-4 md:m-8 bg-white rounded-lg shadow-2xl overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-hotel-dark text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          <div className="bg-gray-100 p-3 sm:p-6 md:p-8">
            <div className="w-full max-w-[210mm] mx-auto" ref={printRef}>
              <PreviewA4 
                formData={evaluation} 
                position={position}
                employeeType={employeeType}
                isViewMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewModal