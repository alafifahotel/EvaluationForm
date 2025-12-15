import { useEffect, useRef, useState, useCallback } from 'react'

// A4 dimensions in pixels at 96 DPI
const MM_TO_PX = 3.7795275591
const A4_WIDTH_PX = 210 * MM_TO_PX  // ~793.7px
const A4_HEIGHT_PX = 297 * MM_TO_PX // ~1122.5px

// Page layout constants
const PAGE_PADDING = 15 * MM_TO_PX // 15mm margins
const HEADER_HEIGHT = 36 // px
const FOOTER_HEIGHT = 28 // px
const CONTENT_HEIGHT = A4_HEIGHT_PX - (PAGE_PADDING * 2) - HEADER_HEIGHT - FOOTER_HEIGHT // ~922px usable

// Minimum height to start new content on a page (avoid nearly empty pages)
const MIN_CONTENT_THRESHOLD = 100

function ProceduresPreviewA4({ departments, metadata }) {
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [pages, setPages] = useState([])

  // Calculate scale for responsive preview
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return
      const parent = containerRef.current.parentElement
      if (!parent) return

      const availableWidth = parent.clientWidth - 32 // padding
      const newScale = Math.min(1, availableWidth / A4_WIDTH_PX)
      setScale(newScale)
    }

    calculateScale()
    window.addEventListener('resize', calculateScale)
    window.addEventListener('orientationchange', () => setTimeout(calculateScale, 100))

    return () => {
      window.removeEventListener('resize', calculateScale)
      window.removeEventListener('orientationchange', calculateScale)
    }
  }, [])

  // Measure element height using hidden container
  const measureHeight = useCallback((element) => {
    if (!measureRef.current) return 0
    measureRef.current.innerHTML = ''
    measureRef.current.appendChild(element.cloneNode(true))
    const height = measureRef.current.firstChild.offsetHeight
    measureRef.current.innerHTML = ''
    return height
  }, [])

  // Calculate page layout
  useEffect(() => {
    if (!measureRef.current || !departments.length) return

    const calculatedPages = []

    // Add cover page
    calculatedPages.push({ type: 'cover' })

    // Add table of contents page
    calculatedPages.push({ type: 'toc' })

    // Calculate content pages
    let currentPage = { type: 'content', pageNumber: 1, items: [] }
    let remainingHeight = CONTENT_HEIGHT

    for (const dept of departments) {
      // Create department header element for measurement
      const deptHeaderEl = document.createElement('div')
      deptHeaderEl.className = 'py-3 px-4 bg-indigo-600 text-white rounded-t-lg mb-2'
      deptHeaderEl.innerHTML = `<h2 class="text-base font-bold">${dept.name}</h2>`
      const deptHeaderHeight = measureHeight(deptHeaderEl) + 16 // + margin

      // Check if we need a new page for department header
      if (remainingHeight < deptHeaderHeight + MIN_CONTENT_THRESHOLD) {
        if (currentPage.items.length > 0) {
          calculatedPages.push(currentPage)
          currentPage = { type: 'content', pageNumber: calculatedPages.length - 1, items: [] }
          remainingHeight = CONTENT_HEIGHT
        }
      }

      // Add department header
      currentPage.items.push({ type: 'department-header', department: dept })
      remainingHeight -= deptHeaderHeight

      for (const proc of dept.procedures) {
        // Create procedure card element for measurement
        const procEl = createProcedureElement(proc)
        const procHeight = measureHeight(procEl)

        if (procHeight <= remainingHeight) {
          // Procedure fits on current page
          currentPage.items.push({ type: 'procedure', procedure: proc, departmentId: dept.id })
          remainingHeight -= procHeight
        } else if (procHeight <= CONTENT_HEIGHT) {
          // Procedure needs new page but fits on one page
          calculatedPages.push(currentPage)
          currentPage = { type: 'content', pageNumber: calculatedPages.length - 1, items: [] }
          currentPage.items.push({ type: 'procedure', procedure: proc, departmentId: dept.id })
          remainingHeight = CONTENT_HEIGHT - procHeight
        } else {
          // Procedure is too long, needs splitting
          const splits = splitProcedure(proc, remainingHeight, measureRef.current)

          for (let i = 0; i < splits.length; i++) {
            const split = splits[i]
            if (i > 0) {
              // Need new page for continuation
              calculatedPages.push(currentPage)
              currentPage = { type: 'content', pageNumber: calculatedPages.length - 1, items: [] }
              remainingHeight = CONTENT_HEIGHT
            }

            currentPage.items.push({
              type: i === 0 ? 'procedure' : 'procedure-continuation',
              procedure: proc,
              departmentId: dept.id,
              startStep: split.startStep,
              endStep: split.endStep,
              showTitle: split.showTitle,
              showMetadata: split.showMetadata
            })
            remainingHeight -= split.height
          }
        }
      }
    }

    // Add final page if it has content
    if (currentPage.items.length > 0) {
      calculatedPages.push(currentPage)
    }

    // Update page numbers
    let contentPageNum = 1
    calculatedPages.forEach(page => {
      if (page.type === 'content') {
        page.pageNumber = contentPageNum++
      }
    })

    setPages(calculatedPages)
  }, [departments, measureHeight])

  // Create procedure element for measurement
  function createProcedureElement(proc, showTitle = true, showMetadata = true, startStep = 0, endStep = null) {
    const steps = proc.steps || []
    const displaySteps = endStep !== null ? steps.slice(startStep, endStep) : steps.slice(startStep)

    const el = document.createElement('div')
    el.className = 'procedure-card border border-gray-200 rounded-lg p-4 mb-3'
    el.style.width = `${A4_WIDTH_PX - PAGE_PADDING * 2}px`

    let html = ''

    if (showTitle) {
      html += `
        <h3 class="text-sm font-bold text-gray-800 pb-2 mb-3 border-b border-gray-200">
          <span class="text-indigo-600">Procédure ${proc.number}</span>
          <span class="mx-2 text-gray-300">|</span>
          ${proc.title}
        </h3>
      `
    } else {
      html += `
        <p class="text-xs text-gray-500 italic mb-2">Procédure ${proc.number} : ${proc.title} (suite)</p>
      `
    }

    if (showMetadata) {
      html += `<div class="space-y-1.5 text-xs mb-3">`
      if (proc.objective) html += `<div class="flex"><span class="w-28 flex-shrink-0 text-gray-500 font-medium">Objectif</span><span class="text-gray-700">${proc.objective}</span></div>`
      if (proc.scope) html += `<div class="flex"><span class="w-28 flex-shrink-0 text-gray-500 font-medium">Champ</span><span class="text-gray-700">${proc.scope}</span></div>`
      if (proc.responsible) html += `<div class="flex"><span class="w-28 flex-shrink-0 text-gray-500 font-medium">Responsable</span><span class="text-gray-700">${proc.responsible}</span></div>`
      if (proc.documents) html += `<div class="flex"><span class="w-28 flex-shrink-0 text-gray-500 font-medium">Documents</span><span class="text-gray-700">${proc.documents}</span></div>`
      if (proc.frequency) html += `<div class="flex"><span class="w-28 flex-shrink-0 text-gray-500 font-medium">Fréquence</span><span class="text-gray-700">${proc.frequency}</span></div>`
      html += `</div>`
    }

    if (displaySteps.length > 0) {
      html += `
        <div class="mt-2">
          <p class="text-xs font-medium text-gray-500 mb-2">${startStep > 0 ? `Étapes (suite)` : 'Étapes à suivre'}</p>
          <ol class="space-y-1">
            ${displaySteps.map((step, idx) => `
              <li class="procedure-step flex gap-2 text-xs">
                <span class="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0" style="font-size: 10px; font-weight: 500;">
                  ${startStep + idx + 1}
                </span>
                <span class="text-gray-700 pt-0.5">${step}</span>
              </li>
            `).join('')}
          </ol>
        </div>
      `
    }

    el.innerHTML = html
    return el
  }

  // Split long procedure into multiple parts
  function splitProcedure(proc, firstPageHeight, measureContainer) {
    const splits = []
    const steps = proc.steps || []

    // First, measure metadata height
    const metaEl = createProcedureElement(proc, true, true, 0, 0)
    const metadataHeight = measureHeight(metaEl) + 30 // base card with title and metadata

    let currentSplit = {
      startStep: 0,
      endStep: 0,
      showTitle: true,
      showMetadata: true,
      height: metadataHeight
    }

    let availableHeight = firstPageHeight

    for (let i = 0; i < steps.length; i++) {
      // Measure this step
      const stepEl = document.createElement('li')
      stepEl.className = 'procedure-step flex gap-2 text-xs'
      stepEl.innerHTML = `
        <span class="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0" style="font-size: 10px;">
          ${i + 1}
        </span>
        <span class="text-gray-700 pt-0.5">${steps[i]}</span>
      `
      measureContainer.innerHTML = ''
      measureContainer.style.width = `${A4_WIDTH_PX - PAGE_PADDING * 2 - 32}px` // card padding
      measureContainer.appendChild(stepEl)
      const stepHeight = stepEl.offsetHeight + 4 // + spacing

      if (currentSplit.height + stepHeight <= availableHeight) {
        currentSplit.endStep = i + 1
        currentSplit.height += stepHeight
      } else {
        // Save current split if it has steps, start new one
        if (currentSplit.endStep > currentSplit.startStep) {
          splits.push({ ...currentSplit })
        }

        currentSplit = {
          startStep: i,
          endStep: i + 1,
          showTitle: false,
          showMetadata: false,
          height: stepHeight + 50 // continuation header
        }
        availableHeight = CONTENT_HEIGHT
      }
    }

    // Add final split
    if (currentSplit.endStep > currentSplit.startStep || splits.length === 0) {
      splits.push(currentSplit)
    }

    return splits
  }

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
        @page {
          size: A4 portrait;
          margin: 0;
        }
      }
    `

    return () => {
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [])

  // Calculate total content pages
  const totalContentPages = pages.filter(p => p.type === 'content').length

  return (
    <div ref={containerRef} id="procedures-print-container" className="bg-gray-100 py-4">
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="fixed"
        style={{
          left: '-9999px',
          top: 0,
          width: `${A4_WIDTH_PX - PAGE_PADDING * 2}px`,
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />

      {/* Pages container with scaling */}
      <div
        className="flex flex-col items-center gap-4"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: scale < 1 ? `${(pages.length * (A4_HEIGHT_PX + 16) * (scale - 1))}px` : 0
        }}
      >
        {pages.map((page, pageIdx) => {
          if (page.type === 'cover') {
            return <CoverPage key={pageIdx} metadata={metadata} />
          }
          if (page.type === 'toc') {
            return <TableOfContentsPage key={pageIdx} departments={departments} />
          }
          return (
            <ContentPage
              key={pageIdx}
              page={page}
              metadata={metadata}
              totalPages={totalContentPages}
            />
          )
        })}
      </div>
    </div>
  )
}

// Cover Page Component
function CoverPage({ metadata }) {
  return (
    <div className="procedures-page bg-white shadow-lg print:shadow-none flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {metadata.title || 'MANUEL DE PROCÉDURES OPÉRATIONNELLES'}
        </h1>
        <div className="w-20 h-1 bg-indigo-600 mx-auto my-6"></div>
        <p className="text-xl text-gray-600 mb-8">{metadata.establishment || 'Hôtel Al Afifa'}</p>
      </div>

      <div className="border-t border-gray-200 pt-6 px-8 pb-4">
        <table className="w-full max-w-sm mx-auto text-left text-sm">
          <tbody>
            <tr>
              <td className="py-1.5 text-gray-500 w-32">Version</td>
              <td className="py-1.5 font-medium text-gray-700">{metadata.version || '1.0'}</td>
            </tr>
            <tr>
              <td className="py-1.5 text-gray-500">Validé par</td>
              <td className="py-1.5 font-medium text-gray-700">{metadata.validatedBy || 'Direction Générale'}</td>
            </tr>
            <tr>
              <td className="py-1.5 text-gray-500">Date</td>
              <td className="py-1.5 font-medium text-gray-700">{metadata.validationDate || '-'}</td>
            </tr>
            <tr>
              <td className="py-1.5 text-gray-500">Distribution</td>
              <td className="py-1.5 font-medium text-gray-700">{metadata.distribution || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center text-xs text-gray-400 pb-6 px-8">
        Document confidentiel - Usage interne uniquement
      </div>
    </div>
  )
}

// Table of Contents Page Component
function TableOfContentsPage({ departments }) {
  return (
    <div className="procedures-page bg-white shadow-lg print:shadow-none">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-200 pb-4">
        TABLE DES MATIÈRES
      </h2>
      <div className="space-y-4">
        {departments.map((dept, deptIdx) => (
          <div key={dept.id}>
            <h3 className="font-bold text-gray-800 text-sm mb-2">
              {deptIdx + 1}. {dept.name}
            </h3>
            <ul className="ml-4 space-y-1">
              {dept.procedures.map((proc) => (
                <li key={proc.id} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Procédure {proc.number} : {proc.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// Content Page Component
function ContentPage({ page, metadata, totalPages }) {
  return (
    <div className="procedures-page bg-white shadow-lg print:shadow-none flex flex-col">
      {/* Page Header */}
      <div className="procedures-page-header flex items-center justify-between border-b border-gray-200 pb-2 mb-4" style={{ height: `${HEADER_HEIGHT}px` }}>
        <span className="text-xs font-medium text-gray-600">
          {metadata.title || 'Manuel de Procédures'}
        </span>
        <span className="text-xs text-gray-500">
          {metadata.establishment || 'Hôtel Al Afifa'}
        </span>
      </div>

      {/* Page Content */}
      <div className="procedures-page-content flex-1">
        {page.items.map((item, itemIdx) => {
          if (item.type === 'department-header') {
            return (
              <div key={itemIdx} className="py-2 px-4 bg-indigo-600 text-white rounded-lg mb-3">
                <h2 className="text-sm font-bold">{item.department.name}</h2>
              </div>
            )
          }

          if (item.type === 'procedure' || item.type === 'procedure-continuation') {
            return (
              <ProcedureCard
                key={itemIdx}
                procedure={item.procedure}
                showTitle={item.showTitle !== false}
                showMetadata={item.showMetadata !== false}
                startStep={item.startStep || 0}
                endStep={item.endStep}
              />
            )
          }

          return null
        })}
      </div>

      {/* Page Footer */}
      <div className="procedures-page-footer flex items-center justify-between border-t border-gray-100 pt-2 mt-auto" style={{ height: `${FOOTER_HEIGHT}px` }}>
        <span className="text-xs text-gray-400">
          Document confidentiel - Usage interne
        </span>
        <span className="text-xs text-gray-500 font-medium">
          Page {page.pageNumber} / {totalPages}
        </span>
      </div>
    </div>
  )
}

// Procedure Card Component
function ProcedureCard({ procedure, showTitle = true, showMetadata = true, startStep = 0, endStep = null }) {
  const steps = procedure.steps || []
  const displaySteps = endStep !== null ? steps.slice(startStep, endStep) : steps.slice(startStep)

  return (
    <div className="procedure-card border border-gray-200 rounded-lg p-4 mb-3">
      {showTitle ? (
        <h3 className="text-sm font-bold text-gray-800 pb-2 mb-3 border-b border-gray-200">
          <span className="text-indigo-600">Procédure {procedure.number}</span>
          <span className="mx-2 text-gray-300">|</span>
          {procedure.title}
        </h3>
      ) : (
        <p className="text-xs text-gray-500 italic mb-2">
          Procédure {procedure.number} : {procedure.title} (suite)
        </p>
      )}

      {showMetadata && (
        <div className="space-y-1.5 text-xs mb-3">
          {procedure.objective && (
            <div className="flex">
              <span className="w-28 flex-shrink-0 text-gray-500 font-medium">Objectif</span>
              <span className="text-gray-700">{procedure.objective}</span>
            </div>
          )}
          {procedure.scope && (
            <div className="flex">
              <span className="w-28 flex-shrink-0 text-gray-500 font-medium">Champ</span>
              <span className="text-gray-700">{procedure.scope}</span>
            </div>
          )}
          {procedure.responsible && (
            <div className="flex">
              <span className="w-28 flex-shrink-0 text-gray-500 font-medium">Responsable</span>
              <span className="text-gray-700">{procedure.responsible}</span>
            </div>
          )}
          {procedure.documents && (
            <div className="flex">
              <span className="w-28 flex-shrink-0 text-gray-500 font-medium">Documents</span>
              <span className="text-gray-700">{procedure.documents}</span>
            </div>
          )}
          {procedure.frequency && (
            <div className="flex">
              <span className="w-28 flex-shrink-0 text-gray-500 font-medium">Fréquence</span>
              <span className="text-gray-700">{procedure.frequency}</span>
            </div>
          )}
        </div>
      )}

      {displaySteps.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500 mb-2">
            {startStep > 0 ? 'Étapes (suite)' : 'Étapes à suivre'}
          </p>
          <ol className="space-y-1">
            {displaySteps.map((step, idx) => (
              <li key={idx} className="procedure-step flex gap-2 text-xs">
                <span
                  className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ fontSize: '10px', fontWeight: 500 }}
                >
                  {startStep + idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default ProceduresPreviewA4
