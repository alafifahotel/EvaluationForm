import { useRef, useEffect } from 'react'
import { 
  commonCriteria, 
  specificCriteria, 
  positions, 
  supervisorPositions,
  appreciationScale,
  supervisorAppreciationScale,
  supervisorTechnicalCriteria,
  supervisorBehavioralCriteria,
  decisions 
} from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import hotelLogo from '../assets/imgs/logo-hotel-al-afifa.png'

function PreviewA4({ formData, position, employeeType = 'employee', isViewMode = false }) {
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
          padding: ${isViewMode ? '5mm 10mm' : '10mm'} !important;
          width: ${isViewMode ? '100%' : '210mm'} !important;
          height: ${isViewMode ? 'auto' : '297mm'} !important;
          max-width: ${isViewMode ? '100%' : '210mm'} !important;
          box-sizing: border-box !important;
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          top: 0 !important;
          transform: none !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
        }
        .print-content[data-employee-type="employee"],
        .print-content[data-employee-type="supervisor"] {
          padding: 20mm 25mm 5mm 25mm !important;
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
  
  const employeeTypeActual = formData.employeeType || employeeType || 'employee'
  const positionsList = employeeTypeActual === 'supervisor' ? supervisorPositions : positions
  const positionLabel = positionsList.find(p => p.value === position)?.label || ''
  const positionCriteria = specificCriteria[position] || []
  
  const calculateTotal = () => {
    if (employeeTypeActual === 'supervisor') {
      const technicalTotal = Object.values(formData.technicalScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const behavioralTotal = Object.values(formData.behavioralScores || {}).reduce((sum, score) => sum + (score || 0), 0)
      const total = technicalTotal + behavioralTotal
      const maxTechnical = supervisorTechnicalCriteria.length * 10 // 6 criteria * 10 points = 60
      const maxBehavioral = supervisorBehavioralCriteria.length * 10 // 6 criteria * 10 points = 60
      const maxTotal = maxTechnical + maxBehavioral // 120 points total
      const percentage = (total / maxTotal) * 100
      return { 
        technicalTotal,
        behavioralTotal,
        total,
        max: maxTotal,
        maxTechnical,
        maxBehavioral,
        percentage: percentage.toFixed(1)
      }
    } else {
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
  }

  const getAppreciation = (percentage) => {
    const scale = employeeTypeActual === 'supervisor' ? supervisorAppreciationScale : appreciationScale
    const scaleItem = scale.find(s => percentage >= s.min && percentage <= s.max)
    return scaleItem || scale[scale.length - 1]
  }

  const calculatedValues = calculateTotal()
  const { total, max, percentage } = calculatedValues
  const appreciation = getAppreciation(percentage)

  const formatDate = (date) => {
    if (!date) return '___________'
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
    } catch {
      return '___________'
    }
  }


  const getScoreColor = (score, maxScore = 5) => {
    if (!score) return 'text-gray-400'
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
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
        <span className={`font-semibold text-xs ${getScoreColor(score, maxScore)}`}>
          {score || '0'}/{maxScore}
        </span>
      </div>
    )
  }

  return (
    <>
      <div 
        ref={previewRef} 
        className="bg-white print-content printable-area" 
        data-employee-type={employeeTypeActual}
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '10mm', 
          fontFamily: 'system-ui, -apple-system, sans-serif', 
          pageBreakInside: 'avoid', 
          pageBreakAfter: 'auto', 
          boxSizing: 'border-box',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: employeeTypeActual === 'employee' ? 'space-between' : 'flex-start'
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
        <div className={`bg-gray-50 rounded-lg p-3 print:bg-gray-50 ${
          employeeTypeActual === 'employee' ? 'mb-6' : 'mb-4'
        }`}>
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

        {/* Criteria Sections - Different for Employees and Supervisors */}
        {employeeTypeActual === 'supervisor' ? (
          <>
            {/* Technical Skills Section for Supervisors */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
                <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">2</span>
                COMPÉTENCES TECHNIQUES
                <span className="ml-auto text-xs font-normal text-gray-600">Total: {calculatedValues.technicalTotal || 0}/{calculatedValues.maxTechnical || 60}</span>
              </h3>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                      <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Note /10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisorTechnicalCriteria.map((criteria, index) => (
                      <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-1">
                          <p className="font-medium text-sm">{criteria.label}</p>
                        </td>
                        <td className="px-2 py-1">
                          <p className="text-gray-600 leading-tight text-xs">{criteria.description}</p>
                        </td>
                        <td className="px-2 py-1 align-middle">
                          <div className="flex items-center justify-center h-full">
                            {renderScoreBar(formData.technicalScores?.[criteria.id], 10)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Behavioral Skills Section for Supervisors */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
                <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">3</span>
                COMPORTEMENT & ATTITUDE
                <span className="ml-auto text-xs font-normal text-gray-600">Total: {calculatedValues.behavioralTotal || 0}/{calculatedValues.maxBehavioral || 60}</span>
              </h3>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '30%' }}>Critère</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-700" style={{ width: '45%' }}>Description</th>
                      <th className="text-center p-1 font-semibold text-gray-700" style={{ width: '25%' }}>Note /10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisorBehavioralCriteria.map((criteria, index) => (
                      <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-1">
                          <p className="font-medium text-sm">{criteria.label}</p>
                        </td>
                        <td className="px-2 py-1">
                          <p className="text-gray-600 leading-tight text-xs">{criteria.description}</p>
                        </td>
                        <td className="px-2 py-1 align-middle">
                          <div className="flex items-center justify-center h-full">
                            {renderScoreBar(formData.behavioralScores?.[criteria.id], 10)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Common Criteria Section for Employees */}
            <div className={employeeTypeActual === 'employee' ? 'mb-6' : 'mb-4'}>
              <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
                <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">2</span>
                CRITÈRES COMMUNS (TOUS SERVICES)
                <span className="ml-auto text-xs font-normal text-gray-600">Total: {calculatedValues.commonTotal || 0}/{calculatedValues.maxCommon || 0}</span>
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

            {/* Specific Criteria Section for Employees */}
            {positionCriteria.length > 0 && (
              <div className={employeeTypeActual === 'employee' ? 'mb-6' : 'mb-4'}>
                <h3 className="text-sm font-bold text-hotel-dark mb-2 flex items-center">
                  <span className="bg-hotel-gold text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs flex-shrink-0">3</span>
                  CRITÈRES SPÉCIFIQUES - {positionLabel.toUpperCase()}
                  <span className="ml-auto text-xs font-normal text-gray-600">Total: {calculatedValues.specificTotal || 0}/{calculatedValues.maxSpecific || 0}</span>
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
          </>
        )}

        {/* Performance Summary */}
        <div className={`relative overflow-hidden rounded-lg print:break-inside-avoid ${
          employeeTypeActual === 'employee' ? 'mb-8 mt-auto' : 'mb-6'
        }`}>
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
        <div className={`print:break-inside-avoid ${
          employeeTypeActual === 'employee' ? 'mb-8' : 'mb-6'
        }`}>
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
              <p className="text-gray-500 text-sm">Signature: ________________________</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600 uppercase tracking-wider mb-2 text-sm">Évaluateur</p>
              <div className="pb-1 mb-2 font-medium text-gray-900 text-sm">
                {formData.evaluateurNom || '________________________________'}
              </div>
              <p className="text-gray-500 text-sm">Signature: ________________________</p>
            </div>
          </div>
          <div className="text-right mt-4">
            <p className="text-gray-600 font-medium text-sm">Date: {formatDate(formData.dateEvaluation)}</p>
          </div>
        </div>

      </div>
    </>
  )
}

export default PreviewA4