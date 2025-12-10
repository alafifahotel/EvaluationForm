import { useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function ProceduresPreviewA4({ departments, metadata }) {
  // Inject print styles
  useEffect(() => {
    const styleId = 'procedures-print-styles'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #procedures-print-container, #procedures-print-container * {
          visibility: visible;
        }
        #procedures-print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .page-break {
          page-break-before: always;
        }
        .no-break {
          page-break-inside: avoid;
        }
        @page {
          size: A4;
          margin: 15mm;
        }
      }
    `

    return () => {
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr })
    } catch {
      return dateStr
    }
  }

  return (
    <div id="procedures-print-container" className="bg-white">
      {/* Cover Page */}
      <div className="min-h-[297mm] p-8 flex flex-col items-center justify-center text-center border border-gray-200 rounded-lg mb-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {metadata.title || 'MANUEL DE PROCÉDURES OPÉRATIONNELLES'}
          </h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto my-8"></div>
          <p className="text-2xl text-gray-600 mb-12">{metadata.establishment || 'Hôtel Al Afifa'}</p>
        </div>

        <div className="border-t border-gray-200 pt-8 w-full max-w-md">
          <table className="w-full text-left text-sm">
            <tbody>
              <tr>
                <td className="py-2 text-gray-500">Version</td>
                <td className="py-2 font-medium">{metadata.version || '1.0'}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Validé par</td>
                <td className="py-2 font-medium">{metadata.validatedBy || 'Direction Générale'}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Date de validation</td>
                <td className="py-2 font-medium">{metadata.validationDate || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-500">Distribution</td>
                <td className="py-2 font-medium">{metadata.distribution || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-xs text-gray-400 max-w-lg">
          Ce document est strictement confidentiel et réservé à un usage interne.
          Il ne peut être reproduit, diffusé ou partagé sans autorisation écrite préalable de la Direction Générale.
        </div>
      </div>

      {/* Table of Contents */}
      <div className="page-break min-h-[297mm] p-8 border border-gray-200 rounded-lg mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">TABLE DES MATIÈRES</h2>
        <div className="space-y-4">
          {departments.map((dept, deptIdx) => (
            <div key={dept.id}>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {deptIdx + 1}. {dept.name}
              </h3>
              <ul className="ml-6 space-y-1">
                {dept.procedures.map((proc) => (
                  <li key={proc.id} className="flex items-center text-sm text-gray-600">
                    <span className="flex-1">Procédure {proc.number} : {proc.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Departments & Procedures */}
      {departments.map((dept, deptIdx) => (
        <div key={dept.id} className={deptIdx > 0 ? 'page-break' : ''}>
          {/* Department Header */}
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-bold">{dept.name}</h2>
          </div>

          {/* Procedures */}
          <div className="border border-gray-200 border-t-0 rounded-b-lg mb-4">
            {dept.procedures.map((proc, procIdx) => (
              <div
                key={proc.id}
                className={`p-6 no-break ${procIdx > 0 ? 'border-t border-gray-200' : ''}`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  PROCÉDURE {proc.number} : {proc.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {proc.objective && (
                    <div>
                      <span className="font-medium text-gray-500">Objectif :</span>
                      <p className="text-gray-700 mt-1">{proc.objective}</p>
                    </div>
                  )}
                  {proc.scope && (
                    <div>
                      <span className="font-medium text-gray-500">Champ d'application :</span>
                      <p className="text-gray-700 mt-1">{proc.scope}</p>
                    </div>
                  )}
                  {proc.responsible && (
                    <div>
                      <span className="font-medium text-gray-500">Responsable :</span>
                      <p className="text-gray-700 mt-1">{proc.responsible}</p>
                    </div>
                  )}
                  {proc.documents && (
                    <div>
                      <span className="font-medium text-gray-500">Documents associés :</span>
                      <p className="text-gray-700 mt-1">{proc.documents}</p>
                    </div>
                  )}
                  {proc.frequency && (
                    <div>
                      <span className="font-medium text-gray-500">Fréquence :</span>
                      <p className="text-gray-700 mt-1">{proc.frequency}</p>
                    </div>
                  )}
                </div>

                {proc.steps && proc.steps.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-500 text-sm">Étapes à suivre :</span>
                    <ol className="mt-2 space-y-2">
                      {proc.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        © {metadata.establishment || 'Hôtel Al Afifa'} {new Date().getFullYear()} - Document confidentiel
      </div>
    </div>
  )
}

export default ProceduresPreviewA4
