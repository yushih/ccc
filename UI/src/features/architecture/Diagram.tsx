import { useMemo, useState } from 'react'
import { applyNodeChanges, Background, Controls, MarkerType, ReactFlow, type Node, type Edge, type NodeChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Architecture } from './schema'
import { placeNodes } from './placement'
import styles from './Diagram.module.css'

export default function Diagram({ architecture }: { architecture: Architecture }) {
  const [selection, setSelection] = useState<{ type: 'node' | 'edge'; id: string }>()
  const toNodes = (previous: Node[]): Node[] => {
    const positions = placeNodes(architecture.nodes.map(n => n.id), Object.fromEntries(previous.map(n => [n.id, n.position])))
    return architecture.nodes.map(node => ({ ...previous.find(n => n.id === node.id), id: node.id, position: positions[node.id], data: { label: node.label }, ariaLabel: `${node.label}, ${node.kind}`, connectable: false, deletable: false, className: styles.node }))
  }
  const [presentation, setPresentation] = useState(() => ({ source: architecture.nodes, nodes: toNodes([]) }))
  // Reconcile semantic replacements while retaining measured dimensions and dragged positions.
  if (presentation.source !== architecture.nodes) setPresentation({ source: architecture.nodes, nodes: toNodes(presentation.nodes) })
  const nodes = useMemo(() => presentation.nodes.map(node => ({ ...node, selected: selection?.type === 'node' && selection.id === node.id })), [presentation.nodes, selection])
  const edges = useMemo<Edge[]>(() => architecture.edges.map(edge => ({ ...edge, selected: selection?.type === 'edge' && selection.id === edge.id, markerEnd: { type: MarkerType.ArrowClosed, color: '#56735c' }, style: { stroke: '#56735c', strokeWidth: 1.5 }, labelStyle: { fill: '#24372b' }, labelBgStyle: { fill: '#f8f7f2' }, deletable: false })), [architecture.edges, selection])
  function onNodesChange(changes: NodeChange[]) {
    setPresentation(previous => ({ ...previous, nodes: applyNodeChanges(changes, previous.nodes) }))
    const selected = changes.find(change => change.type === 'select' && change.selected)
    if (selected?.type === 'select') setSelection({ type: 'node', id: selected.id })
  }
  const selectedNode = selection?.type === 'node' ? architecture.nodes.find(n => n.id === selection.id) : undefined
  const selectedEdge = selection?.type === 'edge' ? architecture.edges.find(e => e.id === selection.id) : undefined
  const nodeLabel = (id: string) => architecture.nodes.find(n => n.id === id)?.label ?? id
  return <div className={styles.diagram}>
    <div className={styles.canvas} aria-label="Interactive architecture diagram">
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onNodeClick={(_, node) => setSelection({ type: 'node', id: node.id })} onEdgeClick={(_, edge) => setSelection({ type: 'edge', id: edge.id })} onPaneClick={() => setSelection(undefined)} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} fitView minZoom={0.2} maxZoom={2}>
        <Background color="#bfc9bd" gap={24} /><Controls showInteractive={false} />
      </ReactFlow>
    </div>
    <div className={styles.inspector}>
      {(selectedNode || selectedEdge) && <section className={styles.details} aria-label="Selection details"><h3>{selectedNode?.label ?? selectedEdge?.label}</h3>{selectedNode ? <><span className={styles.kind}>{selectedNode.kind}</span><p>{selectedNode.description}</p></> : selectedEdge && <p>{nodeLabel(selectedEdge.source)} → {nodeLabel(selectedEdge.target)}</p>}</section>}
      <details open><summary>Components & connections <span>{architecture.nodes.length} / {architecture.edges.length}</span></summary>
        <ul className={styles.list}>{architecture.nodes.map(node => <li key={`node-${node.id}`}><button aria-pressed={selectedNode?.id === node.id} onClick={() => setSelection({ type: 'node', id: node.id })}><span>{node.label}</span>{' '}<span className={styles.kind}>{node.kind}</span></button></li>)}
          {architecture.edges.map(edge => <li key={`edge-${edge.id}`}><button aria-pressed={selectedEdge?.id === edge.id} onClick={() => setSelection({ type: 'edge', id: edge.id })}><span>{edge.label || edge.id}</span>{' '}<span className={styles.kind}>connection</span></button></li>)}</ul>
      </details>
    </div>
  </div>
}
