import OrgNode from './OrgNode'

function OrgChart({ node, isEditMode }) {
  if (!node) return null

  return (
    <div className="org-chart">
      <OrgNode
        node={node}
        isEditMode={isEditMode}
        isRoot={true}
        level={0}
      />
    </div>
  )
}

export default OrgChart
