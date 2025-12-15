import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import OrgNode from './OrgNode'
import { useOrgChart } from '../../contexts/OrgChartContext'

function OrgChart({ node, isEditMode }) {
  const { moveService } = useOrgChart()
  const [activeId, setActiveId] = useState(null)
  const [activeNode, setActiveNode] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activating
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Find node by id recursively
  const findNodeById = (searchNode, id) => {
    if (searchNode.id === id) return searchNode
    if (searchNode.children) {
      for (const child of searchNode.children) {
        const found = findNodeById(child, id)
        if (found) return found
      }
    }
    return null
  }

  // Find parent node id
  const findParentId = (searchNode, targetId, parentId = null) => {
    if (searchNode.id === targetId) return parentId
    if (searchNode.children) {
      for (const child of searchNode.children) {
        const found = findParentId(child, targetId, searchNode.id)
        if (found) return found
      }
    }
    return null
  }

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    const draggedNode = findNodeById(node, active.id)
    setActiveNode(draggedNode)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    setActiveId(null)
    setActiveNode(null)

    if (!over || active.id === over.id) return

    // Get the current parent of the dragged node
    const currentParentId = findParentId(node, active.id)

    // The over.id is the drop target (new parent)
    const newParentId = over.id

    // Don't move if dropping on the same parent
    if (currentParentId === newParentId) return

    // Move the node to the new parent
    moveService(active.id, newParentId)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveNode(null)
  }

  if (!node) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="org-chart">
        <OrgNode
          node={node}
          isEditMode={isEditMode}
          isRoot={true}
          level={0}
          activeId={activeId}
        />
      </div>

      {/* Drag overlay - shows a preview of the dragged item */}
      <DragOverlay>
        {activeNode ? (
          <div className="rounded-lg shadow-xl p-3 bg-white border-2 border-hotel-gold opacity-90">
            <div className="font-medium text-gray-800">
              {activeNode.title && (
                <div className="text-xs uppercase tracking-wide font-semibold text-hotel-gold">
                  {activeNode.title}
                </div>
              )}
              <div>{activeNode.position}</div>
            </div>
            {activeNode.employees && activeNode.employees.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {activeNode.employees.length} employé(s)
              </div>
            )}
            {activeNode.children && activeNode.children.length > 0 && (
              <div className="text-xs text-gray-500">
                + {activeNode.children.length} sous-poste(s)
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default OrgChart
