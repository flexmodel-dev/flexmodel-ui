import React, {useCallback, useEffect, useState} from 'react';
import PageContainer from '@/components/common/PageContainer.tsx';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, message, Space} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {FlowModuleDetail, getElementInstances, getFlowInstance, getFlowModule, NodeInstance,} from '@/services/flow.ts';
import {
  Background,
  Edge,
  Node,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowNode from './components/FlowNode';
import {useFlowParser} from './hooks/useFlowParser';
import {useElementInstanceMerger} from './hooks/useElementInstanceMerger';
import {useProject} from "@/store/appStore";


const nodeTypes = {
  flowNode: FlowNode,
};

const FlowDetail: React.FC = () => {
  const navigate = useNavigate();
  const { flowInstanceId } = useParams<{ flowInstanceId: string }>();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [elementInstances, setElementInstances] = useState<NodeInstance[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (selectedNode) {
      const { nodeInstanceId } = selectedNode.data;
      if (nodeInstanceId) {
        message.info(`节点实例ID: ${nodeInstanceId}`);
      }
    }
  }, [selectedNode]);

  // 使用提取的 hooks
  const { parseFlowModel } = useFlowParser({ setNodes, setEdges });
  const { mergeElementInstances } = useElementInstanceMerger({ setNodes });

  const loadData = useCallback(async () => {
    if (!flowInstanceId) return;
    setLoading(true);
    try {
      const instance = await getFlowInstance(projectId, flowInstanceId);
      const moduleDetail: FlowModuleDetail = await getFlowModule(projectId, instance.flowModuleId, instance.flowDeployId);
      setTitle(moduleDetail.flowName + ` (${instance.flowInstanceId})`);
      if (moduleDetail?.flowModel) {
        parseFlowModel(moduleDetail.flowModel);
      }
      const instances = await getElementInstances(projectId, flowInstanceId);
      setElementInstances(instances || []);
    } catch (e) {
      console.error('加载流程实例详情失败', e);
      message.error('加载流程实例详情失败');
    } finally {
      setLoading(false);
    }
  }, [flowInstanceId, parseFlowModel, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 在定义图渲染完成后再叠加状态，避免竞态
  useEffect(() => {
    if (elementInstances && nodes.length > 0) {
      mergeElementInstances(elementInstances);
    }
  }, [elementInstances, nodes.length, mergeElementInstances]);

  return (
    <PageContainer
      loading={loading}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate(-1)}/>
          {title}
        </Space>
      }
    >
      <ReactFlowProvider>
      <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onPaneClick={() => {
                setSelectedNode(null);
                // 同步清除节点的选中态
                setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, __selected: false } })) as any);
              }}
              onNodeClick={(_, node) => {
                setSelectedNode(node);
                // 同步更新节点的选中态（仅单选）
                setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, __selected: n.id === node.id } })) as any);
              }}
              onConnect={() => {
              }}
              onDrop={() => {
              }}
              onDragOver={() => {
              }}
              onInit={(instance) => setReactFlowInstance(instance)}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background/>
            </ReactFlow>
      </ReactFlowProvider>
    </PageContainer>
  );
};

export default FlowDetail;
