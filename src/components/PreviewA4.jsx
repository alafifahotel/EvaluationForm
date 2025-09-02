import { useRef } from 'react'
import { commonCriteria, specificCriteria, positions, appreciationScale, decisions } from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import hotelLogo from '../assets/imgs/logo-hotel-al-afifa.png'

function PreviewA4({ formData, position, isViewMode = false }) {
  const previewRef = useRef(null)
  
  const positionLabel = positions.find(p => p.value === position)?.label || ''
  const positionCriteria = specificCriteria[position] || []
  
  const calculateTotal = () => {
    const commonTotal = Object.values(formData.commonScores || {}).reduce((sum, score) => sum + (score || 0), 0)
    const specificTotal = Object.values(formData.specificScores || {}).reduce((sum, score) => sum + (score || 0), 0)
    const maxCommon = commonCriteria.length * 5
    const maxSpecific = positionCriteria.length * 5
    const percentage = ((commonTotal + specificTotal) / (maxCommon + maxSpecific)) * 100
    return { 
      commonTotal,
      specificTotal,
      total: commonTotal + specificTotal, 
      maxCommon,
      maxSpecific,
      max: maxCommon + maxSpecific,
      percentage: percentage.toFixed(1) 
    }
  }

  const getAppreciation = (percentage) => {
    const scale = appreciationScale.find(s => percentage >= s.min && percentage <= s.max)
    return scale || appreciationScale[appreciationScale.length - 1]
  }

  const { commonTotal, specificTotal, total, maxCommon, maxSpecific, max, percentage } = calculateTotal()
  const appreciation = getAppreciation(percentage)

  const formatDate = (date) => {
    if (!date) return '___________'
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
    } catch {
      return '___________'
    }
  }

  const handleGeneratePDF = async () => {
    if (!previewRef.current) return

    const canvas = await html2canvas(previewRef.current, {
      scale: 3, // Higher scale for better quality
      logging: false,
      useCORS: true,
      windowWidth: 794,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // Fix alignment issues in cloned document
        const clonedElement = clonedDoc.querySelector('[ref]')
        if (clonedElement) {
          // Ensure all flex items are properly aligned
          const flexItems = clonedElement.querySelectorAll('.flex.items-center')
          flexItems.forEach(item => {
            item.style.alignItems = 'center'
            item.style.display = 'flex'
          })
        }
      }
    })

    const imgData = canvas.toDataURL('image/png', 1.0) // Maximum quality
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Ensure the image fits on one page
    const pageHeight = 297
    if (imgHeight > pageHeight) {
      const scaleFactor = pageHeight / imgHeight
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * scaleFactor, pageHeight)
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    }
    
    const fileName = `EVAL_${positionLabel.replace(/\s+/g, '_')}_${formData.nom || 'Sans_nom'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
    pdf.save(fileName)
  }

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400'
    if (score >= 4.5) return 'text-green-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderScoreBar = (score, maxScore = 5) => {
    const percentage = (score / maxScore) * 100
    return (
      <div className="flex items-center gap-1 w-full">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden relative">
          <div 
            className={`h-full transition-all ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-blue-500' :
              percentage >= 40 ? 'bg-yellow-500' :
              percentage > 0 ? 'bg-red-500' : 'bg-gray-300'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`font-semibold text-xs ${getScoreColor(score)}`}>
          {score || '0'}/5
        </span>
      </div>
    )
  }

  return (
    <div>
      <div ref={previewRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm', maxHeight: '297mm', padding: '10mm', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Professional Header */}
        <div className="border-b-3 border-hotel-gold pb-3 mb-3">
          <div className="flex justify-between items-start">
            <img 
              src={hotelLogo} 
              alt="Al Afifa Hotel" 
              className="h-12 w-auto object-contain"
            />
            <div className="text-right">
              <div className="bg-hotel-gold text-white px-3 py-1 rounded">
                <p className="font-bold text-sm">ÉVALUATION</p>
                <p className="text-xs">{format(new Date(), 'yyyy')}</p>
              </div>
            </div>
          </div>
          <h2 className="text-base font-semibold text-center mt-2 text-gray-700">
            FICHE D'ÉVALUATION DU PERSONNEL
          </h2>
        </div>

        {/* Employee Information Section */}
        <div className="bg-gray-50 rounded p-2 mb-3">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">1</span>
            INFORMATIONS DE L'EMPLOYÉ
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Nom & Prénom</label>
                <div className="font-medium text-gray-900">
                  {formData.nom || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Service</label>
                <div className="font-medium text-gray-900">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Supérieur Hiérarchique</label>
                <div className="font-medium text-gray-900">
                  {formData.superieur || '________________________________'}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Matricule</label>
                <div className="font-medium text-gray-900">
                  {formData.matricule || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Poste</label>
                <div className="font-medium text-gray-900">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '10px' }}>Période d'Évaluation</label>
                <div className="font-medium text-gray-900">
                  Du {formatDate(formData.dateDebut)} au {formatDate(formData.dateFin)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Criteria Section */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">2</span>
            CRITÈRES COMMUNS
            <span className="ml-auto text-xs font-normal text-gray-600">Total: {commonTotal}/{maxCommon}</span>
          </h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                  <th className="text-left p-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                  <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Évaluation</th>
                </tr>
              </thead>
              <tbody>
                {commonCriteria.map((criteria, index) => (
                  <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-1">
                      <p className="font-medium" style={{ fontSize: '10px' }}>{criteria.label}</p>
                    </td>
                    <td className="p-1">
                      <p className="text-gray-600 leading-tight" style={{ fontSize: '9px' }}>{criteria.description}</p>
                    </td>
                    <td className="p-1 align-middle">
                      <div className="flex items-center justify-center h-full">
                        {renderScoreBar(formData.commonScores?.[criteria.id])}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specific Criteria Section */}
        {positionCriteria.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
              <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">3</span>
              CRITÈRES SPÉCIFIQUES - {positionLabel.toUpperCase()}
              <span className="ml-auto text-xs font-normal text-gray-600">Total: {specificTotal}/{maxSpecific}</span>
            </h3>
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                    <th className="text-left p-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                    <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Évaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {positionCriteria.map((criteria, index) => (
                    <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1">
                        <p className="font-medium" style={{ fontSize: '10px' }}>{criteria.label}</p>
                      </td>
                      <td className="p-1">
                        <p className="text-gray-600 leading-tight" style={{ fontSize: '9px' }}>{criteria.description}</p>
                      </td>
                      <td className="p-1 align-middle">
                        <div className="flex items-center justify-center h-full">
                          {renderScoreBar(formData.specificScores?.[criteria.id])}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="relative overflow-hidden rounded-lg mb-3">
          <div className="absolute inset-0 bg-gradient-to-br from-hotel-gold via-yellow-500 to-yellow-600 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative p-3 text-white">
            <h3 className="text-sm font-bold mb-2 flex items-center">
              <span className="bg-white/20 backdrop-blur-sm text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs border border-white/30 flex-shrink-0">4</span>
              RÉSULTAT DE L'ÉVALUATION
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-lg font-bold">{total}/{max}</p>
                  <p style={{ fontSize: '9px' }} className="uppercase tracking-wider opacity-90">Points Obtenus</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-lg font-bold">{percentage}%</p>
                  <p style={{ fontSize: '9px' }} className="uppercase tracking-wider opacity-90">Pourcentage</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-base font-bold">{appreciation.label}</p>
                  <p style={{ fontSize: '9px' }} className="uppercase tracking-wider opacity-90">Appréciation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decisions and Recommendations */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">5</span>
            DÉCISIONS & RECOMMANDATIONS
          </h3>
          <div className="border border-gray-300 rounded p-2">
            <div className="grid grid-cols-2 gap-2">
              {decisions.map(decision => (
                <div key={decision.id} className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.decisions?.includes(decision.id) 
                      ? 'bg-hotel-gold border-hotel-gold' 
                      : 'border-gray-400'
                  }`}>
                    {formData.decisions?.includes(decision.id) && (
                      <span className="text-white" style={{ fontSize: '10px' }}>✓</span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px' }}>{decision.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="border-t-2 border-gray-300 pt-2">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">6</span>
            VALIDATION
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Évalué(e)</p>
              <div className="pb-1 mb-2 font-medium text-gray-900 text-xs">
                {formData.nom || '________________________________'}
              </div>
              <p className="text-gray-500 mb-2" style={{ fontSize: '10px' }}>Signature: ________________________</p>
              <p className="text-gray-500" style={{ fontSize: '10px' }}>Date: {formatDate()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Évaluateur</p>
              <div className="pb-1 mb-2 font-medium text-gray-900 text-xs">
                {formData.evaluateurNom || '________________________________'}
              </div>
              <p className="text-gray-500 mb-2" style={{ fontSize: '10px' }}>Signature: ________________________</p>
              <p className="text-gray-500" style={{ fontSize: '10px' }}>Date: {formatDate(formData.dateEvaluation)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center">
          <p style={{ fontSize: '9px' }} className="text-gray-400">
            Al Afifa Hotel - Document Confidentiel - Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
          <p style={{ fontSize: '9px' }} className="text-gray-400 mt-1">
            Ce document est strictement confidentiel et réservé à l'usage interne
          </p>
        </div>
      </div>

      {!isViewMode && (
        <div className="p-4 no-print">
          <button
            onClick={handleGeneratePDF}
            className="w-full bg-hotel-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger en PDF
          </button>
        </div>
      )}
    </div>
  )
}

export default PreviewA4