import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

export async function generatePDF(evaluation, positionLabel) {
  // Create a temporary container for rendering
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '210mm'
  document.body.appendChild(container)

  // Import and render the PreviewA4 component
  const { default: React } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { default: PreviewA4 } = await import('../components/PreviewA4')
  const { positions, specificCriteria } = await import('../data/criteriaConfig')
  
  // Find the position value from the evaluation's service
  const position = positions.find(p => p.label === evaluation.service)?.value || ''

  return new Promise((resolve, reject) => {
    // Create root and render
    const root = createRoot(container)
    
    const element = React.createElement(PreviewA4, {
      formData: evaluation,
      position: position,
      isViewMode: true
    })

    root.render(element)

    // Wait for render to complete
    setTimeout(async () => {
      try {
        // Find the preview element
        const previewElement = container.querySelector('.bg-white[style*="210mm"]')
        
        if (!previewElement) {
          throw new Error('Preview element not found')
        }

        // Generate canvas with high quality settings
        const canvas = await html2canvas(previewElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          windowWidth: 794, // A4 width in pixels at 96 DPI
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // Ensure all styles are applied to the cloned document
            const clonedElement = clonedDoc.querySelector('.bg-white[style*="210mm"]')
            if (clonedElement) {
              clonedElement.style.width = '210mm'
              clonedElement.style.minHeight = '297mm'
              clonedElement.style.padding = '15mm'
            }
          }
        })

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgWidth = 210
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        
        // Generate filename
        const fileName = `EVAL_${positionLabel.replace(/\s+/g, '_')}_${evaluation.nom.replace(/\s+/g, '_')}_${format(new Date(evaluation.dateEvaluation), 'yyyy-MM-dd')}.pdf`
        
        // Save the PDF
        pdf.save(fileName)
        
        // Cleanup
        root.unmount()
        document.body.removeChild(container)
        
        resolve(fileName)
      } catch (error) {
        // Cleanup on error
        root.unmount()
        document.body.removeChild(container)
        reject(error)
      }
    }, 500) // Give time for component to fully render
  })
}