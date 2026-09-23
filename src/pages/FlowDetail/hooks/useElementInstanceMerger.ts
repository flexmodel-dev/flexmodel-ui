import {useCallback} from 'react';
import {Edge, Node} from '@xyflow/react';
import {ElementInstance} from '@/services/flow.ts';
import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';

interface UseElementInstanceMergerProps {
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
}

export const useElementInstanceMerger = ({setNodes, setEdges}: UseElementInstanceMergerProps) => {
  const mergeElementInstances = useCallback((instances: ElementInstance[]) => {
    if (!instances || instances.length === 0) return;

    const nodeInstances = instances.filter(ins => ins.type !== FlowElementType.SEQUENCE_FLOW);
    const edgeInstances = instances.filter(ins => ins.type === FlowElementType.SEQUENCE_FLOW);

    const byKey = new Map<string, ElementInstance>();
    const byNodeKey = new Map<string, ElementInstance>();
    nodeInstances.forEach(ins => {
      if (ins.key) byKey.set(ins.key, ins);
      if ((ins as any).nodeKey) byNodeKey.set((ins as any).nodeKey, ins);
    });
    setNodes(prev => prev.map(n => {
      const match = byKey.get(n.id) || byNodeKey.get(n.id);
      if (!match) return n;
      return {...n,
        data: {
          ...n.data,
          status: match.status,
          nodeInstanceId: match.nodeInstanceId,
          instanceDataId: match.instanceDataId
        }
      } as Node;
    }));

    const edgeByKey = new Map<string, ElementInstance>();
    edgeInstances.forEach(ins => {
      if (ins.key) edgeByKey.set(ins.key, ins);
    });
    setEdges(prev => prev.map(e => {
      const match = edgeByKey.get(e.id);
      if (!match) return e;
      return {...e, data: {...(e.data || {}), status: match.status}} as Edge;
    }));
  }, [setNodes, setEdges]);

  return { mergeElementInstances };
};
