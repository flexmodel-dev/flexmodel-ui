import React, {useCallback, useEffect, useRef} from "react";
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

  const nodeTypes = {
    erNode: ({data}: { data: { entity: Entity } }) => (
      <div style={{position: 'relative'}}>
        <Handle id="top" type="source" position={Position.Top}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="right" type="source" position={Position.Right}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="bottom" type="source" position={Position.Bottom}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="left" type="source" position={Position.Left}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="top-t" type="target" position={Position.Top}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="right-t" type="target" position={Position.Right}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="bottom-t" type="target" position={Position.Bottom}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <Handle id="left-t" type="target" position={Position.Left}
                style={{opacity: 0, width: 0, height: 0, border: 'none'}}/>
        <ERNodeView entity={data.entity}/>
      </div>
    ),
  };

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
          nodes={nodes}
          edges={edges}
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
            style: {strokeWidth: 2, stroke: token.colorPrimary},
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
