// Department color scheme for organizational chart
// Colors chosen based on industry best practices for hotel/hospitality org charts
// Each color has semantic meaning related to the department's function

export const DEPARTMENT_COLORS = {
  // Direction / Executive - Deep charcoal with gold accent (authority, prestige)
  'direction': {
    id: 'direction',
    primary: '#1a1a1a',
    accent: '#D4AF37',
    light: '#2d2d2d',
    text: '#ffffff',
    border: '#D4AF37'
  },

  // Hébergement / Accommodation - Teal/Cyan (hospitality, comfort, trust)
  'hebergement': {
    id: 'hebergement',
    primary: '#0891B2',
    accent: '#06B6D4',
    light: '#ECFEFF',
    text: '#164E63',
    border: '#0891B2'
  },

  // Cuisine / Kitchen - Warm Orange (energy, appetite, creativity)
  'cuisine': {
    id: 'cuisine',
    primary: '#EA580C',
    accent: '#F97316',
    light: '#FFF7ED',
    text: '#9A3412',
    border: '#EA580C'
  },

  // Restauration & Bar - Rich Burgundy/Wine (elegance, fine dining)
  'restauration': {
    id: 'restauration',
    primary: '#9F1239',
    accent: '#BE123C',
    light: '#FFF1F2',
    text: '#881337',
    border: '#9F1239'
  },

  // Espaces Publics & Jardins - Fresh Green (nature, cleanliness, growth)
  'espaces-publics': {
    id: 'espaces-publics',
    primary: '#16A34A',
    accent: '#22C55E',
    light: '#F0FDF4',
    text: '#166534',
    border: '#16A34A'
  },

  // Administration & RH - Professional Blue (trust, organization, people)
  'admin-rh': {
    id: 'admin-rh',
    primary: '#2563EB',
    accent: '#3B82F6',
    light: '#EFF6FF',
    text: '#1E40AF',
    border: '#2563EB'
  },

  // Comptabilité & Économat - Slate/Navy (finance, stability, precision)
  'comptabilite': {
    id: 'comptabilite',
    primary: '#475569',
    accent: '#64748B',
    light: '#F8FAFC',
    text: '#334155',
    border: '#475569'
  },

  // Maintenance / Technique - Industrial Gray/Steel (technical, reliable)
  'maintenance': {
    id: 'maintenance',
    primary: '#71717A',
    accent: '#A1A1AA',
    light: '#FAFAFA',
    text: '#3F3F46',
    border: '#71717A'
  }
}

// Pre-defined color palette for new departments (elegant, professional colors)
// These are carefully selected to complement the existing department colors
const NEW_DEPARTMENT_PALETTE = [
  { primary: '#7C3AED', accent: '#8B5CF6', light: '#F5F3FF', text: '#5B21B6', border: '#7C3AED' }, // Purple
  { primary: '#0D9488', accent: '#14B8A6', light: '#F0FDFA', text: '#115E59', border: '#0D9488' }, // Teal
  { primary: '#DC2626', accent: '#EF4444', light: '#FEF2F2', text: '#991B1B', border: '#DC2626' }, // Red
  { primary: '#CA8A04', accent: '#EAB308', light: '#FEFCE8', text: '#854D0E', border: '#CA8A04' }, // Amber
  { primary: '#4F46E5', accent: '#6366F1', light: '#EEF2FF', text: '#3730A3', border: '#4F46E5' }, // Indigo
  { primary: '#DB2777', accent: '#EC4899', light: '#FDF2F8', text: '#9D174D', border: '#DB2777' }, // Pink
  { primary: '#059669', accent: '#10B981', light: '#ECFDF5', text: '#047857', border: '#059669' }, // Emerald
  { primary: '#0284C7', accent: '#0EA5E9', light: '#F0F9FF', text: '#075985', border: '#0284C7' }, // Sky
  { primary: '#9333EA', accent: '#A855F7', light: '#FAF5FF', text: '#7E22CE', border: '#9333EA' }, // Violet
  { primary: '#C2410C', accent: '#EA580C', light: '#FFF7ED', text: '#9A3412', border: '#C2410C' }  // Orange-red
]

// Get department color by ID, with fallback for unknown departments
export const getDepartmentColor = (departmentId, allDepartments = []) => {
  // Check if it's a known department
  if (DEPARTMENT_COLORS[departmentId]) {
    return DEPARTMENT_COLORS[departmentId]
  }

  // For unknown departments, generate a consistent color based on the ID
  // This ensures the same department always gets the same color
  const usedColors = new Set(
    allDepartments
      .filter(id => DEPARTMENT_COLORS[id])
      .map(id => DEPARTMENT_COLORS[id].primary)
  )

  // Find unused colors from palette
  const availableColors = NEW_DEPARTMENT_PALETTE.filter(
    color => !usedColors.has(color.primary)
  )

  if (availableColors.length > 0) {
    // Use hash of department ID to consistently pick a color
    const hash = departmentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colorIndex = hash % availableColors.length
    return { id: departmentId, ...availableColors[colorIndex] }
  }

  // If all palette colors are used, generate a random but consistent color
  return generateColorFromId(departmentId)
}

// Generate a color scheme from a department ID (deterministic)
export const generateColorFromId = (id) => {
  // Create a simple hash from the ID
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash = hash & hash
  }

  // Generate HSL values (avoiding too light or too dark colors)
  const hue = Math.abs(hash % 360)
  const saturation = 50 + Math.abs((hash >> 8) % 30) // 50-80%
  const lightness = 35 + Math.abs((hash >> 16) % 15) // 35-50%

  const primary = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  const accent = `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`
  const light = `hsl(${hue}, ${saturation - 30}%, 97%)`
  const text = `hsl(${hue}, ${saturation}%, ${lightness - 15}%)`
  const border = primary

  return { id, primary, accent, light, text, border }
}

// Find the root department ID for a node (traverse up to find the department)
export const findDepartmentId = (node, rootStructure) => {
  // If node has a title, it's a department head
  if (node.title) {
    return node.id
  }

  // Otherwise, find parent department by searching the tree
  const findParentDepartment = (searchNode, targetId, currentDeptId = null) => {
    // Update current department if this node has a title
    const deptId = searchNode.title ? searchNode.id : currentDeptId

    // Found the target
    if (searchNode.id === targetId) {
      return deptId
    }

    // Search children
    if (searchNode.children) {
      for (const child of searchNode.children) {
        const result = findParentDepartment(child, targetId, deptId)
        if (result) return result
      }
    }

    return null
  }

  return findParentDepartment(rootStructure, node.id) || 'default'
}

// Get all department IDs from the structure (only level 1 departments)
export const getAllDepartmentIds = (structure) => {
  const departments = []

  // Only direct children of root with titles are departments
  if (structure && structure.children) {
    structure.children.forEach(child => {
      if (child.title) {
        departments.push(child.id)
      }
    })
  }

  return departments
}
