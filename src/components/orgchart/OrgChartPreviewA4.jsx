import { useRef, useEffect, useState } from 'react'
import hotelLogo from '../../assets/imgs/logo-hotel-al-afifa.png'
import { getDepartmentColor, getAllDepartmentIds } from '../../data/departmentColors'

// Compact box-based tree for print layout
function BoxTreeNode({ node, level = 0, departmentId = null, allDepartments = [] }) {
  const hasChildren = node.children && node.children.length > 0

  // Only level 1 nodes with titles are actual departments
  const isActualDepartment = level === 1 && node.title
  const currentDepartmentId = isActualDepartment ? node.id : departmentId

  // Check if this is a sub-section head (has title but not a department)
  const isSubSection = node.title && level > 1

  // Get department color
  const deptColor = currentDepartmentId ? getDepartmentColor(currentDepartmentId, allDepartments) : null

  // Calculate depth within department
  const depthInDepartment = isActualDepartment ? 0 : (level > 1 ? level - 1 : 0)

  // Get styles based on level and department with shade variations
  const getStyles = () => {
    if (level === 0) {
      return {
        borderColor: '#D4AF37',
        backgroundColor: '#1a1a1a',
        titleColor: '#D4AF37',
        positionColor: '#ffffff',
        employeesColor: '#d1d5db'
      }
    }

    if (deptColor) {
      // Calculate border opacity based on role
      const borderOpacity = isActualDepartment ? 1 : isSubSection ? 0.8 : Math.max(0.5, 1 - (depthInDepartment * 0.15))
      const borderColor = `${deptColor.primary}${Math.round(borderOpacity * 255).toString(16).padStart(2, '0')}`

      // Background varies by role
      let backgroundColor = '#ffffff'
      if (isActualDepartment) {
        backgroundColor = deptColor.light
      } else if (isSubSection) {
        backgroundColor = `${deptColor.primary}0A`
      }

      return {
        borderColor,
        backgroundColor,
        titleColor: deptColor.primary,
        positionColor: isActualDepartment ? deptColor.text : '#1f2937',
        employeesColor: '#4b5563'
      }
    }

    return {
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
      titleColor: '#6b7280',
      positionColor: '#1f2937',
      employeesColor: '#4b5563'
    }
  }

  const styles = getStyles()

  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      <div
        className="border-l-2 px-2 py-0.5 mb-0.5 print-node"
        style={{
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor
        }}
      >
        <div className="flex items-baseline gap-1 flex-wrap">
          {node.title && (
            <span
              className="text-[9px] font-bold uppercase print-title"
              style={{ color: styles.titleColor }}
            >
              {node.title}
            </span>
          )}
          <span
            className="text-[10px] font-semibold print-position"
            style={{ color: styles.positionColor }}
          >
            {node.position}
          </span>
          {node.employees && node.employees.length > 0 && (
            <>
              <span className="text-[9px] text-gray-400">—</span>
              {node.employees.map((emp, idx) => (
                <span
                  key={idx}
                  className="text-[9px] print-employee"
                  style={{ color: styles.employeesColor }}
                >
                  {emp}{idx < node.employees.length - 1 ? ', ' : ''}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {hasChildren && (
        <div>
          {node.children.map((child) => (
            <BoxTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              departmentId={currentDepartmentId}
              allDepartments={allDepartments}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrgChartPreviewA4({ structure }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement
        if (parent) {
          const a4Width = 210 * 3.7795
          const availableWidth = parent.clientWidth - 32
          const newScale = Math.min(1, availableWidth / a4Width)
          setScale(newScale)
        }
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const countEmployees = (node) => {
    let count = node.employees?.length || 0
    if (node.children) {
      for (const child of node.children) {
        count += countEmployees(child)
      }
    }
    return count
  }

  const countPositions = (node) => {
    let count = 1
    if (node.children) {
      for (const child of node.children) {
        count += countPositions(child)
      }
    }
    return count
  }

  const totalEmployees = structure ? countEmployees(structure) : 0
  const totalPositions = structure ? countPositions(structure) : 0
  const allDepartments = structure ? getAllDepartmentIds(structure) : []

  return (
    <div className="flex justify-center">
      {/* Preview container (scaled for viewport) */}
      <div
        ref={containerRef}
        className="bg-white shadow-lg origin-top print:shadow-none printable-orgchart-container"
        style={{
          width: '210mm',
          minHeight: '297mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Printable content */}
        <div
          className="printable-orgchart p-8"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6 pb-4 border-b-2"
            style={{ borderColor: '#D4AF37' }}
          >
            <div className="flex items-center gap-4">
              <img src={hotelLogo} alt="Al Afifa Hotel" className="h-14 w-auto" />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>Al Afifa Hotel</h1>
                <p className="text-sm text-gray-600">Organigramme du Personnel</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Mise à jour</p>
              <p className="text-sm font-medium text-gray-700">{currentDate}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span>{totalEmployees} employés</span>
                <span>{totalPositions} postes</span>
              </div>
            </div>
          </div>

          {/* Org Chart */}
          <div className="space-y-0">
            {structure && <BoxTreeNode node={structure} level={0} allDepartments={allDepartments} />}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-[10px] text-center text-gray-400 print-footer">
              Document confidentiel - Usage interne uniquement
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgChartPreviewA4
