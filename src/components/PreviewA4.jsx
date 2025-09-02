import { useRef } from 'react'
import { commonCriteria, specificCriteria, positions, appreciationScale, decisions } from '../data/criteriaConfig'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function PreviewA4({ formData, position }) {
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
      total: commonTotal + specificTotal, 
      max: maxCommon + maxSpecific,
      percentage: percentage.toFixed(1) 
    }
  }

  const getAppreciation = (percentage) => {
    const scale = appreciationScale.find(s => percentage >= s.min && percentage <= s.max)
    return scale || appreciationScale[appreciationScale.length - 1]
  }

  const { total, max, percentage } = calculateTotal()
  const appreciation = getAppreciation(percentage)

  const formatDate = (date) => {
    if (!date) return '___/___/___'
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
    } catch {
      return '___/___/___'
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

  return (
    <div>
      <div ref={previewRef} className="print-page bg-white p-8" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Al Afifa Hotel</h1>
          <h2 className="text-xl">Fiche d'Évaluation du Personnel Hôtelier</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">Informations générales</h3>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-semibold w-1/3">Nom & Prénom</td>
                <td className="py-2">{formData.nom || '_______________________________________'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Matricule</td>
                <td className="py-2">{formData.matricule || '_______________________________________'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Service</td>
                <td className="py-2">{positionLabel}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Poste</td>
                <td className="py-2">{positionLabel}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Supérieur hiérarchique</td>
                <td className="py-2">{formData.superieur || '_______________________________________'}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Période d'évaluation</td>
                <td className="py-2">
                  Du {formatDate(formData.dateDebut)} au {formatDate(formData.dateFin)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">Critères communs (tous services)</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Critère</th>
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2 w-20">Note /5</th>
              </tr>
            </thead>
            <tbody>
              {commonCriteria.map(criteria => (
                <tr key={criteria.id} className="border-b">
                  <td className="py-2 font-semibold">{criteria.label}</td>
                  <td className="py-2 text-sm">{criteria.description}</td>
                  <td className="py-2 text-center">
                    {formData.commonScores?.[criteria.id] || '___'}/5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {positionCriteria.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">
              Critères spécifiques - {positionLabel}
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Critère</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2 w-20">Note /5</th>
                </tr>
              </thead>
              <tbody>
                {positionCriteria.map(criteria => (
                  <tr key={criteria.id} className="border-b">
                    <td className="py-2 font-semibold">{criteria.label}</td>
                    <td className="py-2 text-sm">{criteria.description}</td>
                    <td className="py-2 text-center">
                      {formData.specificScores?.[criteria.id] || '___'}/5
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">Note finale</h3>
          <div className="space-y-2">
            <p><span className="font-semibold">Total points obtenus:</span> {total} / {max}</p>
            <p><span className="font-semibold">Pourcentage:</span> {percentage}%</p>
            <p>
              <span className="font-semibold">Appréciation générale:</span>{' '}
              <span className={`font-bold ${appreciation.color}`}>
                {appreciation.label}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">Décision / Recommandations</h3>
          <div className="space-y-1">
            {decisions.map(decision => (
              <div key={decision.id} className="flex items-center gap-2">
                <span className="text-lg">
                  {formData.decisions?.includes(decision.id) ? '☑' : '☐'}
                </span>
                <span>{decision.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">Signatures</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Rôle</th>
                <th className="text-left py-2">Nom et Signature</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-4 font-semibold">Évalué(e)</td>
                <td className="py-4">{formData.nom || '_______________________________________'}</td>
                <td className="py-4">___/___/___</td>
              </tr>
              <tr className="border-t">
                <td className="py-4 font-semibold">Évaluateur</td>
                <td className="py-4">{formData.evaluateurNom || '_______________________________________'}</td>
                <td className="py-4">{formatDate(formData.dateEvaluation)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Document généré le: {format(new Date(), 'dd/MM/yyyy', { locale: fr })}</p>
        </div>
      </div>

      <div className="p-4 no-print">
        <button
          onClick={handleGeneratePDF}
          className="w-full bg-hotel-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          Télécharger en PDF
        </button>
      </div>
    </div>
  )
}

export default PreviewA4