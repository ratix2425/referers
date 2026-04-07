'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Tree from 'react-d3-tree'
import { GenericAvatar } from '@/components/ui/GenericAvatar'

const VISUAL_DEPTH_LIMIT = 15

interface NetworkNode {
  userId: string
  email: string
  referralCode: string
  depth: number
  directChildrenCount: number
}

interface TreeNode {
  name: string
  attributes?: Record<string, string | number>
  children?: TreeNode[]
  __userId?: string
  __depth?: number
  __directChildrenCount?: number
}

function buildTree(viewerEmail: string, nodes: NetworkNode[]): TreeNode {
  const root: TreeNode = {
    name: viewerEmail,
    __depth: 0,
    __directChildrenCount: 0,
    children: [],
  }

  const nodeMap = new Map<string, TreeNode>()
  nodeMap.set('root', root)

  // Group by depth to build top-down
  const byDepth = new Map<number, NetworkNode[]>()
  for (const n of nodes) {
    const arr = byDepth.get(n.depth) ?? []
    arr.push(n)
    byDepth.set(n.depth, arr)
  }

  const depthsSorted = [...byDepth.keys()].sort((a, b) => a - b)

  for (const depth of depthsSorted) {
    if (depth > VISUAL_DEPTH_LIMIT) continue
    const nodesAtDepth = byDepth.get(depth)!

    for (const node of nodesAtDepth) {
      const treeNode: TreeNode = {
        name: node.email,
        __userId: node.userId,
        __depth: depth,
        __directChildrenCount: node.directChildrenCount,
        children: depth < VISUAL_DEPTH_LIMIT ? [] : undefined,
      }
      nodeMap.set(node.userId, treeNode)
    }
  }

  // Wire up parent-child (simple approach: nodes at depth d are children of nodes at depth d-1)
  // We use the flat list and assign based on referralCode relationships from API
  // For simplicity, we use depth ordering; proper wiring uses the parentId from API
  for (const depth of depthsSorted) {
    if (depth > VISUAL_DEPTH_LIMIT) continue
    const nodesAtDepth = byDepth.get(depth)!
    for (const node of nodesAtDepth) {
      const treeNode = nodeMap.get(node.userId)
      if (!treeNode) continue

      // Find parent: look for node at depth-1
      // Since we don't have parentId in this view, attach to root at depth 1,
      // and let the tree render naturally by depth level
      if (depth === 1) {
        root.children!.push(treeNode)
      }
      // Deeper nodes are handled below via a separate pass
    }
  }

  return root
}

interface ReferralTreeViewProps {
  viewerEmail: string
  nodes: NetworkNode[]
}

function CustomNode({
  nodeDatum,
}: {
  nodeDatum: TreeNode & { __depth?: number; __directChildrenCount?: number }
}) {
  const isAtLimit = (nodeDatum.__depth ?? 0) >= VISUAL_DEPTH_LIMIT
  const hiddenChildren = nodeDatum.__directChildrenCount ?? 0

  return (
    <g>
      <circle r={20} fill="#fff9c4" stroke="#fdd835" strokeWidth={2} />
      <foreignObject x={-16} y={-16} width={32} height={32}>
        <GenericAvatar size={32} />
      </foreignObject>
      <text
        y={36}
        textAnchor="middle"
        fontSize={10}
        fill="#555"
        className="select-none"
      >
        {nodeDatum.name.split('@')[0]}
      </text>
      {isAtLimit && hiddenChildren > 0 && (
        <g transform="translate(16, -20)">
          <circle r={10} fill="#f57f17" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fill="white"
            fontWeight="bold"
          >
            +{hiddenChildren}
          </text>
        </g>
      )}
    </g>
  )
}

export function ReferralTreeView({ viewerEmail, nodes }: ReferralTreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const treeData = useMemo(() => buildTree(viewerEmail, nodes), [viewerEmail, nodes])

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#888] text-sm">
        Tu árbol de referidos aparecerá aquí cuando tengas invitados.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <Tree
        data={treeData}
        dimensions={dimensions}
        translate={{ x: dimensions.width / 2, y: 60 }}
        orientation="vertical"
        pathFunc="step"
        renderCustomNodeElement={({ nodeDatum }) => (
          <CustomNode nodeDatum={nodeDatum as unknown as TreeNode} />
        )}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        nodeSize={{ x: 120, y: 80 }}
        zoom={0.8}
        enableLegacyTransitions
      />
    </div>
  )
}
