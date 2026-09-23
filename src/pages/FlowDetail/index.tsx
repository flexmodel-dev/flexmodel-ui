import React, {useCallback, useEffect, useState} from 'react';
import PageContainer from '@/components/common/PageContainer.tsx';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, message, Popconfirm, Space, theme} from 'antd';
import {ArrowLeftOutlined, StopOutlined} from '@ant-design/icons';
import {
  FlowModuleDetail,
  FlowInstanceStatus,
  getElementInstances,
  getFlowInstance,
  getFlowModule,
  FlowInstance,
  NodeInstance,
  terminateFlowInstance,
} from '@/services/flow.ts';
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
import NodeDetailDrawer from './components/NodeDetailDrawer';
import NodeSummaryToolbar from './components/NodeSummaryToolbar';
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
  const {token} = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [elementInstances, setElementInstances] = useState<NodeInstance[] | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [flowInstance, setFlowInstance] = useState<FlowInstance | null>(null);

  // 节点详情通过 NodeDetailDrawer 展示，点击节点时打开
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) ?? null : null;

  const [terminating, setTerminating] = useState(false);

  // 终止流程实例
  const handleTerminate = async () => {
    if (!flowInstanceId) return;
    setTerminating(true);
    try {
      await terminateFlowInstance(projectId, flowInstanceId);
      message.success('流程实例终止成功');
      loadData();
    } catch (error) {
      console.error('终止流程实例失败:', error);
      message.error('终止流程实例失败');
    } finally {
      setTerminating(false);
    }
  };

  // 浣跨敤鎻愬彇鐨?hooks
  const { parseFlowModel } = useFlowParser({ setNodes, setEdges });
  const {mergeElementInstances} = useElementInstanceMerger({setNodes, setEdges});

  const loadData = useCallback(async () => {
    if (!flowInstanceId || !projectId) return;
    setLoading(true);
    try {
      const instance = await getFlowInstance(projectId, flowInstanceId);
      setFlowInstance(instance);
      const moduleDetail: FlowModuleDetail = await getFlowModule(projectId, instance.flowModuleId, instance.flowDeployId);
      setTitle(moduleDetail.flowName + ` (${instance.flowInstanceId})`);
      if (moduleDetail?.flowModel) {
        parseFlowModel(moduleDetail.flowModel);
      }
      const instances = await getElementInstances(projectId, flowInstanceId);
      setElementInstances(instances || []);
    } catch (e) {
      console.error('鍔犺浇娴佺▼瀹炰緥璇︽儏澶辫触', e);
      message.error('鍔犺浇娴佺▼瀹炰緥璇︽儏澶辫触');
    } finally {
      setLoading(false);
    }
  }, [flowInstanceId, parseFlowModel, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 鍦ㄥ畾涔夊浘娓叉煋瀹屾垚鍚庡啀鍙犲姞鐘舵€侊紝閬垮厤绔炴€?
  useEffect(() => {
    if (elementInstances && nodes.length > 0) {
      mergeElementInstances(elementInstances);
    }
  }, [elementInstances, nodes.length, mergeElementInstances]);

  return (
    <PageContainer
      loading={loading}
      style={{padding: 0, border: 'none', borderRadius: 0, height: '100vh'}}
      bodyStyle={{ padding: 0, overflow: 'hidden' }}
      headerStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '8px 16px' }}
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate(-1)}/>
          {title}
        </Space>
      }
      extra={
        flowInstance?.status === FlowInstanceStatus.RUNNING ? (
          <Popconfirm
            title="确定要终止这个流程实例吗？"
            onConfirm={handleTerminate}
            okText="确定终止"
            cancelText="取消"
            okButtonProps={{danger: true}}
          >
            <Button danger icon={<StopOutlined/>} loading={terminating}>终止流程</Button>
          </Popconfirm>
        ) : undefined
      }
    >
      <NodeSummaryToolbar node={selectedNode} flowInstance={flowInstance}/>
      <ReactFlowProvider>
      <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onPaneClick={() => {
                setSelectedNodeId(null);
                // 鍚屾娓呴櫎鑺傜偣鐨勯€変腑鎬?
                setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, __selected: false } })) as any);
              }}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id);
                // 鍚屾鏇存柊鑺傜偣鐨勯€変腑鎬侊紙浠呭崟閫夛級
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
      <NodeDetailDrawer
        node={selectedNode}
        projectId={projectId}
        flowInstanceId={flowInstanceId || ''}
        flowStatus={flowInstance?.status}
        onClose={() => setSelectedNodeId(null)}
        onCommitted={loadData}
      />
    </PageContainer>
  );
};

export default FlowDetail;
