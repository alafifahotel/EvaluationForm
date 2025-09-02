import { useRef, useEffect } from 'react'
import { commonCriteria, specificCriteria, positions, appreciationScale, decisions } from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import hotelLogo from '../assets/imgs/logo-hotel-al-afifa.png'

function PreviewA4({ formData, position, isViewMode = false }) {
  const previewRef = useRef(null)
  
  useEffect(() => {
    const calculateScale = () => {
      if (!previewRef.current) return
      
      const container = previewRef.current.parentElement
      if (!container) return
      
      const containerWidth = container.clientWidth
      const a4WidthMm = 210
      const mmToPx = 3.7795275591 // 1mm = 3.7795275591px at 96dpi
      const a4WidthPx = a4WidthMm * mmToPx
      
      if (containerWidth < a4WidthPx) {
        const scale = containerWidth / a4WidthPx
        previewRef.current.style.transform = `scale(${scale})`
        previewRef.current.style.transformOrigin = 'top left'
        // Adjust container height to prevent excess whitespace
        const a4HeightMm = 297
        const a4HeightPx = a4HeightMm * mmToPx
        const scaledHeight = a4HeightPx * scale
        previewRef.current.style.marginBottom = `${scaledHeight - a4HeightPx}px`
      } else {
        previewRef.current.style.transform = ''
        previewRef.current.style.marginBottom = ''
      }
    }
    
    calculateScale()
    window.addEventListener('resize', calculateScale)
    
    // Recalculate on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateScale, 100)
    })
    
    // Add print styles
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          min-height: 0 !important;
        }
        * {
          page-break-before: avoid !important;
        }
        .print-content {
          margin: 0 auto !important;
          padding: 10mm !important;
          width: 210mm !important;
          height: 297mm !important;
          max-width: 210mm !important;
          box-sizing: border-box !important;
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          top: 0 !important;
          transform: none !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
        }
        .no-print, .print\\:hidden {
          display: none !important;
        }
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      window.removeEventListener('resize', calculateScale)
      window.removeEventListener('orientationchange', calculateScale)
      document.head.removeChild(style)
    }
  }, [])
  
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
    <>
      <div 
        ref={previewRef} 
        className="bg-white print-content printable-area" 
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '10mm', 
          fontFamily: 'system-ui, -apple-system, sans-serif', 
          pageBreakInside: 'avoid', 
          pageBreakAfter: 'auto', 
          boxSizing: 'border-box',
          margin: '0 auto'
        }}>
        {/* Professional Header */}
        <div className="border-b-3 border-hotel-gold pb-3 mb-4" style={{ borderColor: '#daa520', borderBottomWidth: '3px' }}>
          <div className="flex justify-between items-start">
            <img 
              src={hotelLogo} 
              alt="Al Afifa Hotel" 
              className="h-12 w-auto object-contain print:h-12"
            />
            <div className="text-right">
              <div className="bg-hotel-gold text-white px-4 py-2 rounded">
                <p className="font-bold text-base">ÉVALUATION</p>
                <p className="text-sm">{format(new Date(), 'yyyy')}</p>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-bold text-center mt-2 text-gray-700">
            FICHE D'ÉVALUATION DU PERSONNEL
          </h2>
        </div>

        {/* Employee Information Section */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 print:bg-gray-50">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">1</span>
            INFORMATIONS DE L'EMPLOYÉ
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Nom & Prénom</label>
                <div className="font-medium text-gray-900 text-base">
                  {formData.nom || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Service</label>
                <div className="font-medium text-gray-900 text-base">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Supérieur Hiérarchique</label>
                <div className="font-medium text-gray-900 text-base">
                  {formData.superieur || '________________________________'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Matricule</label>
                <div className="font-medium text-gray-900 text-base">
                  {formData.matricule || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Poste</label>
                <div className="font-medium text-gray-900 text-base">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-600 uppercase tracking-wider text-xs">Période d'Évaluation</label>
                <div className="font-medium text-gray-900 text-base">
                  Du {formatDate(formData.dateDebut)} au {formatDate(formData.dateFin)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Criteria Section */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">2</span>
            CRITÈRES COMMUNS
            <span className="ml-auto text-xs font-normal text-gray-600">Total: {commonTotal}/{maxCommon}</span>
          </h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                  <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                  <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Évaluation</th>
                </tr>
              </thead>
              <tbody>
                {commonCriteria.map((criteria, index) => (
                  <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 py-1">
                      <p className="font-medium text-sm">{criteria.label}</p>
                    </td>
                    <td className="px-2 py-1">
                      <p className="text-gray-600 leading-tight text-xs">{criteria.description}</p>
                    </td>
                    <td className="px-2 py-1 align-middle">
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
          <div className="mb-4">
            <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
              <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">3</span>
              CRITÈRES SPÉCIFIQUES - {positionLabel.toUpperCase()}
              <span className="ml-auto text-xs font-normal text-gray-600">Total: {specificTotal}/{maxSpecific}</span>
            </h3>
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                    <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                    <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Évaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {positionCriteria.map((criteria, index) => (
                    <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1">
                        <p className="font-medium text-sm">{criteria.label}</p>
                      </td>
                      <td className="px-2 py-1">
                        <p className="text-gray-600 leading-tight text-xs">{criteria.description}</p>
                      </td>
                      <td className="px-2 py-1 align-middle">
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
        <div className="relative overflow-hidden rounded-lg mb-6 print:break-inside-avoid">
          <div className="absolute inset-0 bg-gradient-to-br from-hotel-gold via-yellow-500 to-yellow-600 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative p-3 text-white">
            <h3 className="text-base font-bold mb-3 flex items-center">
              <span className="bg-white/20 backdrop-blur-sm text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 border border-white/30 text-xs flex-shrink-0">4</span>
              RÉSULTAT DE L'ÉVALUATION
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-lg font-bold">{total}/{max}</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Points Obtenus</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-lg font-bold">{percentage}%</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Pourcentage</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
                  <p className="text-base font-bold">{appreciation.label}</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Appréciation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decisions and Recommendations */}
        <div className="mb-6 print:break-inside-avoid">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">5</span>
            DÉCISIONS & RECOMMANDATIONS
          </h3>
          <div className="border border-gray-300 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              {decisions.map(decision => (
                <div key={decision.id} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.decisions?.includes(decision.id) 
                      ? 'bg-hotel-gold border-hotel-gold' 
                      : 'border-gray-400'
                  }`}>
                    {formData.decisions?.includes(decision.id) && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-sm">{decision.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="border-t-2 border-gray-300 pt-3 print:break-inside-avoid">
          <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
            <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">6</span>
            VALIDATION
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-600 uppercase tracking-wider mb-2 text-sm">Évalué(e)</p>
              <div className="pb-1 mb-2 font-medium text-gray-900 text-sm">
                {formData.nom || '________________________________'}
              </div>
              <p className="text-gray-500 mb-2 text-sm">Signature: ________________________</p>
              <p className="text-gray-500 text-sm">Date: {formatDate()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 uppercase tracking-wider mb-2 text-sm">Évaluateur</p>
              <div className="pb-1 mb-2 font-medium text-gray-900 text-sm">
                {formData.evaluateurNom || '________________________________'}
              </div>
              <p className="text-gray-500 mb-2 text-sm">Signature: ________________________</p>
              <p className="text-gray-500 text-sm">Date: {formatDate(formData.dateEvaluation)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center print:break-inside-avoid">
          <p className="text-xs text-gray-400">
            Al Afifa Hotel - Document Confidentiel - Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
          <p style={{ fontSize: '9px' }} className="text-gray-400 mt-1">
            Ce document est strictement confidentiel et réservé à l'usage interne
          </p>
        </div>
      </div>
    </>
  )
}

export default PreviewA4