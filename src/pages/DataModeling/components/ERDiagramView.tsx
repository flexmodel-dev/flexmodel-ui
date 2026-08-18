import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {theme} from "antd";
import {Entity, Field} from '@/types/data-modeling';
import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ERNodeView from './ERNodeView';

interface ERDiagramProps {
  data: Entity[];
}

const ERDiagram: React.FC<ERDiagramProps> = ({data}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {token} = theme.useToken();
  const {fitView} = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({
    erNode: ({data}: { data: { entity: Entity; dim?: boolean } }) => (
      <div
        style={{position: 'relative'}}
        onMouseEnter={() => setHoveredNodeId(String(data.entity.name))}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        <Handle id="top" type="source" position={Position.Top}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="right" type="source" position={Position.Right}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="bottom" type="source" position={Position.Bottom}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="left" type="source" position={Position.Left}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="top-t" type="target" position={Position.Top}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="right-t" type="target" position={Position.Right}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="bottom-t" type="target" position={Position.Bottom}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <Handle id="left-t" type="target" position={Position.Left}
                style={{opacity: 0, background: 'transparent', border: 'none'}}/>
        <ERNodeView entity={data.entity} dim={data.dim}/>
      </div>
    ),
  }), []);

  useEffect(() => {
    const newNodes = (data || []).filter(e => e.type === 'Entity').map((entity, idx) => {
      const x = 80 + (idx % 5) * 320;
      const y = 80 + Math.floor(idx / 5) * 300;
      const width = 200;
      const height = 60 + (entity.fields?.length || 0) * 22;
      return {
        id: String(entity.name),
        position: {x, y},
        data: {entity},
        type: 'erNode',
        style: {width, height},
        width,
        height,
        draggable: true,
      } as Node<any>;
    });

    const nodeCenter = (n: any) => {
      return {cx: n.position.x + (n.width || 200) / 2, cy: n.position.y + (n.height || 60) / 2};
    };

    const opposite = (side: string) => ({
      left: 'right-t',
      right: 'left-t',
      top: 'bottom-t',
      bottom: 'top-t',
    } as any)[side];

    const chooseSide = (from: any, to: any) => {
      const a = nodeCenter(from);
      const b = nodeCenter(to);
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? 'right' : 'left';
      }
      return dy >= 0 ? 'bottom' : 'top';
    };

    const nodeMap = new Map<string, any>(newNodes.map(n => [n.id, n]));

    const edgeMap = new Map<string, any>();
    (data || []).forEach((entity) => {
      if (entity.type === 'Entity') {
        (entity.fields || []).forEach((field: Field) => {
          if (field.type === 'ModelRef' && field.from && field.from !== entity.name) {
            const sourceId = String(field.from);
            const targetId = String(entity.name);
            const key = [sourceId, targetId].sort().join('::');
            const label = field.name;

            if (edgeMap.has(key)) {
              const exist = edgeMap.get(key);
              const existLabel = exist.label ?? '';
              if (label && existLabel && !String(existLabel).includes(label)) {
                exist.label = `${existLabel} | ${label}`;
              }
            } else {
              const sourceNode = nodeMap.get(sourceId);
              const targetNode = nodeMap.get(targetId);
              const side = sourceNode && targetNode ? chooseSide(sourceNode, targetNode) : 'right';
              edgeMap.set(key, {
                id: key,
                source: sourceId,
                target: targetId,
                sourceHandle: side,
                targetHandle: opposite(side),
                label,
                type: 'smoothstep',
                markerEnd: {type: MarkerType.ArrowClosed, color: token.colorBorderSecondary},
              } as Edge<any>);
            }
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(Array.from(edgeMap.values()));
    setTimeout(() => fitView(), 100);
  }, [data, fitView, setNodes, setEdges]);

  const resizeGraph = useCallback(() => {
    if (!containerRef.current) return;
    setTimeout(() => fitView(), 0);
  }, [fitView]);

  useEffect(() => {
    if (!containerRef.current) return;
    resizeGraph();
    window.addEventListener('resize', resizeGraph);
    return () => {
      window.removeEventListener('resize', resizeGraph);
    };
  }, [resizeGraph]);

  // 邻接关系：节点 -> 关联节点集合
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edges.forEach(e => {
      const s = String(e.source);
      const t = String(e.target);
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    });
    return map;
  }, [edges]);

  // 根据悬浮状态派生展示用的节点（整个节点背景色变化）
  const displayNodes = useMemo(() => {
    if (!hoveredNodeId) return nodes;
    const related = adjacency.get(hoveredNodeId) || new Set<string>();
    return nodes.map(n => {
      const isActive = n.id === hoveredNodeId;
      const isRelated = related.has(n.id);
      return {
        ...n,
        data: {...n.data, highlight: isActive || isRelated, dim: !isActive && !isRelated},
      };
    });
  }, [nodes, hoveredNodeId, adjacency]);

  // 根据悬浮状态派生展示用的连线（仅连线颜色变化）
  const displayEdges = useMemo(() => {
    if (!hoveredNodeId) return edges;
    const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const dur = '0.28s';
    return edges.map(e => {
      const connected = e.source === hoveredNodeId || e.target === hoveredNodeId;
      const stroke = connected ? token.colorTextSecondary : token.colorFillSecondary;
      return {
        ...e,
        style: {
          ...e.style,
          stroke,
          strokeWidth: 1.5,
          opacity: connected ? 1 : 0.4,
          transition: `stroke ${dur} ${ease}, stroke-width ${dur} ${ease}, opacity ${dur} ${ease}`,
        },
        markerEnd: {type: MarkerType.ArrowClosed, color: stroke},
        labelStyle: {
          fill: connected ? token.colorText : token.colorTextTertiary,
          opacity: connected ? 1 : 0.4,
          transition: `fill ${dur} ${ease}, opacity ${dur} ${ease}`,
        } as any,
      };
    });
  }, [edges, hoveredNodeId, token]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .react-flow__controls button { background: ${token.colorBgContainer} !important; color: ${token.colorText} !important; border: 1px solid ${token.colorBorderSecondary} !important; }
            .react-flow__controls button:hover { background: ${token.colorFillSecondary} !important; }
            .react-flow__controls button svg { fill: ${token.colorText} !important; }
          `,
        }}
      />
      <div ref={containerRef} style={{width: '100%', height: '100%', overflow: 'hidden'}}>
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultViewport={{x: 0, y: 0, zoom: 0.6}}
          minZoom={0.2}
          maxZoom={2}
          fitView
          nodesDraggable
          panOnDrag
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: {type: MarkerType.ArrowClosed},
            style: {strokeWidth: 1.5, stroke: token.colorBorderSecondary},
            labelShowBg: true,
            labelBgStyle: {fill: token.colorBgContainer, fillOpacity: 0.9} as any,
            labelStyle: {fill: token.colorTextSecondary, fontWeight: 400} as any,
          }}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap
            style={{
              height: 120,
              bottom: 30,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: token.boxShadowSecondary as string
            }}
            zoomable
            pannable
            nodeColor={() => token.colorTextTertiary}
            nodeStrokeColor={() => token.colorTextSecondary}
            maskColor={token.colorFillSecondary as string}
          />
          <Controls style={{bottom: 30}}/>
          <Background/>
        </ReactFlow>
      </div>
    </>
  );
};

const ERDiagramWrapper: React.FC<ERDiagramProps> = (props) => (
  <ReactFlowProvider>
    <ERDiagram {...props} />
  </ReactFlowProvider>
);

export default ERDiagramWrapper;
