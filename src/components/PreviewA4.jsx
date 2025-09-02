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
      scale: 2,
      logging: false,
      useCORS: true,
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    
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
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
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
        <span className={`font-semibold ${getScoreColor(score)}`}>
          {score || '0'}/5
        </span>
      </div>
    )
  }

  return (
    <div>
      <div ref={previewRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Professional Header */}
        <div className="border-b-4 border-hotel-gold pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img 
                src={hotelLogo} 
                alt="Al Afifa Hotel" 
                className="h-16 w-auto object-contain"
              />
              <div>
                <p className="text-gray-600 text-sm">Excellence in Hospitality</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-hotel-gold text-white px-4 py-2 rounded">
                <p className="font-bold text-lg">ÉVALUATION</p>
                <p className="text-sm">{format(new Date(), 'yyyy')}</p>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mt-6 text-gray-700">
            FICHE D'ÉVALUATION DU PERSONNEL
          </h2>
        </div>

        {/* Employee Information Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-hotel-dark mb-3 flex items-center">
            <span className="bg-hotel-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
            INFORMATIONS DE L'EMPLOYÉ
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom & Prénom</label>
                <div className="py-1 font-medium text-gray-900">
                  {formData.nom || '________________________________'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</label>
                <div className="py-1 font-medium text-gray-900">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Supérieur Hiérarchique</label>
                <div className="py-1 font-medium text-gray-900">
                  {formData.superieur || '________________________________'}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Matricule</label>
                <div className="py-1 font-medium text-gray-900">
                  {formData.matricule || '________________________________'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Poste</label>
                <div className="py-1 font-medium text-gray-900">
                  {positionLabel || '________________________________'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Période d'Évaluation</label>
                <div className="py-1 font-medium text-gray-900">
                  Du {formatDate(formData.dateDebut)} au {formatDate(formData.dateFin)}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Common Criteria Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-hotel-dark mb-3 flex items-center">
            <span className="bg-hotel-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
            CRITÈRES COMMUNS
            <span className="ml-auto text-sm font-normal text-gray-600">Total: {commonTotal}/{maxCommon}</span>
          </h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-2/5">Critère</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-2/5">Description</th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700 w-1/5">Évaluation</th>
                </tr>
              </thead>
              <tbody>
                {commonCriteria.map((criteria, index) => (
                  <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">
                      <p className="font-medium text-sm">{criteria.label}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-gray-600">{criteria.description}</p>
                    </td>
                    <td className="p-3">
                      {renderScoreBar(formData.commonScores?.[criteria.id])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specific Criteria Section */}
        {positionCriteria.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-hotel-dark mb-3 flex items-center">
              <span className="bg-hotel-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
              CRITÈRES SPÉCIFIQUES - {positionLabel.toUpperCase()}
              <span className="ml-auto text-sm font-normal text-gray-600">Total: {specificTotal}/{maxSpecific}</span>
            </h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 w-2/5">Critère</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700 w-2/5">Description</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700 w-1/5">Évaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {positionCriteria.map((criteria, index) => (
                    <tr key={criteria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        <p className="font-medium text-sm">{criteria.label}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-gray-600">{criteria.description}</p>
                      </td>
                      <td className="p-3">
                        {renderScoreBar(formData.specificScores?.[criteria.id])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="relative overflow-hidden rounded-xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-hotel-gold via-yellow-500 to-yellow-600 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="bg-white/20 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm border border-white/30">4</span>
              RÉSULTAT DE L'ÉVALUATION
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-3xl font-bold mb-1">{total}/{max}</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Points Obtenus</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-3xl font-bold mb-1">{percentage}%</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Pourcentage</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-xl font-bold mb-1">{appreciation.label}</p>
                  <p className="text-xs uppercase tracking-wider opacity-90">Appréciation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decisions and Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-hotel-dark mb-3 flex items-center">
            <span className="bg-hotel-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
            DÉCISIONS & RECOMMANDATIONS
          </h3>
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {decisions.map(decision => (
                <div key={decision.id} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.decisions?.includes(decision.id) 
                      ? 'bg-hotel-gold border-hotel-gold' 
                      : 'border-gray-400'
                  }`}>
                    {formData.decisions?.includes(decision.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-sm">{decision.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="border-t-2 border-gray-300 pt-4">
          <h3 className="text-lg font-bold text-hotel-dark mb-3 flex items-center">
            <span className="bg-hotel-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">6</span>
            VALIDATION
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Évalué(e)</p>
              <div className="pb-1 mb-3 font-medium text-gray-900">
                {formData.nom || '________________________________'}
              </div>
              <p className="text-xs text-gray-500 mb-3">Signature: ________________________</p>
              <p className="text-xs text-gray-500">Date: {formatDate()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Évaluateur</p>
              <div className="pb-1 mb-3 font-medium text-gray-900">
                {formData.evaluateurNom || '________________________________'}
              </div>
              <p className="text-xs text-gray-500 mb-3">Signature: ________________________</p>
              <p className="text-xs text-gray-500">Date: {formatDate(formData.dateEvaluation)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Al Afifa Hotel - Document Confidentiel - Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
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