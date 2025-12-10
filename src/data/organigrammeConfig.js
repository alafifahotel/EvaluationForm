// Default organizational chart structure for the hotel
// Only includes positions with actual employees assigned
// Users can add new positions as needed

export const getDefaultOrganigramme = () => ({
  version: 1,
  lastModified: new Date().toISOString(),
  structure: {
    id: "direction",
    title: "Direction Générale",
    position: "Directeur de l'exploitation",
    employees: ["Ali Bachir"],
    children: [
      // Département Hébergement
      {
        id: "hebergement",
        title: "Département Hébergement",
        position: "Responsable Hébergement",
        employees: ["Youmna Jaber"],
        children: [
          {
            id: "reception",
            position: "Chef de Réception",
            employees: ["Abdoulaye Samb"],
            children: []
          },
          {
            id: "gouvernante",
            position: "Gouvernante Générale",
            employees: ["Lucie Tine"],
            children: [
              { id: "gouv-1", position: "Aide gouvernant", employees: ["Abdou Seydi Seck", "René Lagahuzere"], children: [] }
            ]
          }
        ]
      },
      // Département Cuisine
      {
        id: "cuisine",
        title: "Département Cuisine",
        position: "Chef de Cuisine",
        employees: ["Waranka Ba"],
        children: [
          {
            id: "sous-chefs",
            position: "Sous-chef",
            employees: ["Mohamed Mbaye", "Tamsir Seck"],
            children: [
              { id: "cuis-1", position: "Chef de partie", employees: ["Mamina Diedhiou"], children: [] }
            ]
          }
        ]
      },
      // Département Restauration & Bar
      {
        id: "restauration",
        title: "Département Restauration & Bar",
        position: "Responsable Restauration",
        employees: ["Yoba Mballo"],
        children: [
          {
            id: "rang",
            position: "Chef de rang",
            employees: ["Frederic Tendeng", "Mohamed Diedhiou"],
            children: []
          },
          {
            id: "bar",
            position: "Chef barman",
            employees: ["Alassane Sané"],
            children: []
          }
        ]
      },
      // Département Espaces Publics & Jardins
      {
        id: "espaces-publics",
        title: "Département Espaces Publics & Jardins",
        position: "Responsable Espaces Publics",
        employees: ["Rahmé Kassem"],
        children: [
          { id: "esp-1", position: "Jardinier", employees: ["Cheikh Kabe"], children: [] }
        ]
      },
      // Administration & RH
      {
        id: "admin-rh",
        title: "Administration & RH",
        position: "Responsable Administration & RH",
        employees: ["Abdoulaye Cissé"],
        children: [
          { id: "admin-1", position: "Secrétaire", employees: ["Rose Thiam"], children: [] },
          { id: "admin-2", position: "Commis d'Administration", employees: ["Serigne Ndiaye"], children: [] }
        ]
      },
      // Comptabilité & Économat
      {
        id: "comptabilite",
        title: "Comptabilité & Économat",
        position: "Responsable Comptabilité",
        employees: ["Pape Mamadou Seck"],
        children: [
          { id: "compta-1", position: "Comptable", employees: ["Abdoul Aziz Gning"], children: [] },
          { id: "compta-2", position: "Caissière principale", employees: ["Diouma Diouf"], children: [] },
          { id: "compta-3", position: "Contrôleur", employees: ["Mah Touré"], children: [] },
          { id: "compta-4", position: "Achats/Econome", employees: ["Catherine Diedhiou"], children: [] }
        ]
      },
      // Maintenance / Technique
      {
        id: "maintenance",
        title: "Maintenance / Technique",
        position: "Ouvrier spécialisé",
        employees: ["Oumar Sène", "Bacary Badji"],
        children: []
      }
    ]
  }
})

// Helper function to generate unique IDs
export const generateNodeId = () => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to find a node by ID in the tree
export const findNodeById = (node, id) => {
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  return null
}

// Helper function to update a node in the tree (returns new tree)
export const updateNodeInTree = (node, id, updater) => {
  if (node.id === id) {
    return typeof updater === 'function' ? updater(node) : { ...node, ...updater }
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(child => updateNodeInTree(child, id, updater))
    }
  }
  return node
}

// Helper function to add a child node
export const addChildToNode = (node, parentId, newChild) => {
  if (node.id === parentId) {
    return {
      ...node,
      children: [...(node.children || []), newChild]
    }
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(child => addChildToNode(child, parentId, newChild))
    }
  }
  return node
}

// Helper function to remove a node from the tree
export const removeNodeFromTree = (node, idToRemove) => {
  if (node.children) {
    const filteredChildren = node.children.filter(child => child.id !== idToRemove)
    return {
      ...node,
      children: filteredChildren.map(child => removeNodeFromTree(child, idToRemove))
    }
  }
  return node
}

// Helper function to count total employees in the tree
export const countTotalEmployees = (node) => {
  let count = node.employees?.length || 0
  if (node.children) {
    for (const child of node.children) {
      count += countTotalEmployees(child)
    }
  }
  return count
}

// Helper function to count total positions in the tree
export const countTotalPositions = (node) => {
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countTotalPositions(child)
    }
  }
  return count
}

// Helper function to reorder children within a parent node
export const reorderChildrenInTree = (node, parentId, childId, direction) => {
  if (!node) return node

  if (node.id === parentId && node.children && node.children.length > 1) {
    const currentIndex = node.children.findIndex(c => c.id === childId)

    if (currentIndex === -1) return node

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // Bounds check
    if (newIndex < 0 || newIndex >= node.children.length) return node

    // Create new array with swapped elements (explicit approach)
    const newChildren = [...node.children]
    const temp = newChildren[currentIndex]
    newChildren[currentIndex] = newChildren[newIndex]
    newChildren[newIndex] = temp

    return { ...node, children: newChildren }
  }

  if (node.children && node.children.length > 0) {
    const newChildren = node.children.map(child =>
      reorderChildrenInTree(child, parentId, childId, direction)
    )
    // Only return new object if children actually changed
    const hasChanged = newChildren.some((child, i) => child !== node.children[i])
    if (hasChanged) {
      return { ...node, children: newChildren }
    }
  }

  return node
}
