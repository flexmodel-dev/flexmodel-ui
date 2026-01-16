import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Layout, message, Space, theme} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeftOutlined, MenuUnfoldOutlined, SettingOutlined} from '@ant-design/icons';
import {
  addEdge,
  Background,
  Connection,
  Edge,
  EdgeTypes,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodePanel from '@/pages/FlowDesign/components/NodePanel';
import PropertyPanel from '@/pages/FlowDesign/components/PropertyPanel';
import FlowSettingsPanel from '@/pages/FlowDesign/components/FlowSettingsPanel';
import StartEventNode from '@/pages/FlowDesign/components/nodes/StartEventNode';
import EndEventNode from '@/pages/FlowDesign/components/nodes/EndEventNode';
import UserTaskNode from '@/pages/FlowDesign/components/nodes/UserTaskNode';
import ServiceTaskNode from '@/pages/FlowDesign/components/nodes/ServiceTaskNode';
import ExclusiveGatewayNode from '@/pages/FlowDesign/components/nodes/ExclusiveGatewayNode';
import ParallelGatewayNode from '@/pages/FlowDesign/components/nodes/ParallelGatewayNode';
import InclusiveGatewayNode from '@/pages/FlowDesign/components/nodes/InclusiveGatewayNode';
import CallActivityNode from '@/pages/FlowDesign/components/nodes/CallActivityNode';
import SequenceFlowNode from '@/pages/FlowDesign/components/nodes/SequenceFlowNode';
import ArrowEdge from '@/pages/FlowDesign/components/edges/ArrowEdge';
import {FlowElementType} from '@/pages/FlowDesign/types/flow.ts';
import {generateId} from '@/pages/FlowDesign/utils/flow';
import {PageContainer} from '@/components/common';
import {deployFlow, getFlowModule, updateFlow, UpdateFlowRequest} from '@/services/flow';
import {useProject} from '@/store/appStore';

const {Sider, Content} = Layout;

// 自定义节点类型
const nodeTypes: NodeTypes = {
  startEvent: StartEventNode,
  endEvent: EndEventNode,
  userTask: UserTaskNode,
  serviceTask: ServiceTaskNode,
  exclusiveGateway: ExclusiveGatewayNode,
  parallelGateway: ParallelGatewayNode,
  inclusiveGateway: InclusiveGatewayNode,
  callActivity: CallActivityNode,
  sequenceFlow: SequenceFlowNode,
};

// 自定义边类型
const edgeTypes: EdgeTypes = {
  arrow: ArrowEdge,
};

// 自定义边类型
interface CustomEdge extends Edge {
  type: 'arrow';
  sourceHandle: string | null;
  targetHandle: string | null;
  data: {
    conditionsequenceflow: string;
    defaultConditions: string;
    onDelete: (edgeId: string) => void;
    onInsert?: (edgeId: string, nodeType: string) => void;
  };
}

const FlowDesign: React.FC = () => {
  const navigate = useNavigate();
  const {flowModuleId: routeFlowModuleId} = useParams<{ flowModuleId: string }>();
  const {token} = theme.useToken();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<CustomEdge | null>(null);
  const [flowName, setFlowName] = useState('');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [propertyPanelVisible, setPropertyPanelVisible] = useState(false);
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, CustomEdge> | null>(null);
  const [invalidNodeIds, setInvalidNodeIds] = useState<Set<string>>(new Set()); // 校验失败的节点ID集合
  const propertyPanelRef = useRef<{ validateCurrentNode: () => Promise<boolean> }>(null);

  // 流程设置相关状态
  const [flowKey, setFlowKey] = useState('');
  const [flowRemark, setFlowRemark] = useState('');

  const [flowModuleId, setFlowModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);

  // 辅助函数：将FlowElementType转换为ReactFlow节点类型
  const getNodeTypeFromFlowElementType = (type: number): string => {
    const typeMap: Record<number, string> = {
      [FlowElementType.START_EVENT]: 'startEvent',
      [FlowElementType.END_EVENT]: 'endEvent',
      [FlowElementType.USER_TASK]: 'userTask',
      [FlowElementType.SERVICE_TASK]: 'serviceTask',
      [FlowElementType.EXCLUSIVE_GATEWAY]: 'exclusiveGateway',
      [FlowElementType.PARALLEL_GATEWAY]: 'parallelGateway',
      [FlowElementType.INCLUSIVE_GATEWAY]: 'inclusiveGateway',
      [FlowElementType.CALL_ACTIVITY]: 'callActivity',
    };
    return typeMap[type] || 'userTask';
  };

  // 处理节点删除
  const handleNodeDelete = useCallback((nodeId: string) => {
    console.log('handleNodeDelete called with nodeId:', nodeId);
    setNodes((nds) => {
      console.log('Current nodes before deletion:', nds.map(n => n.id));
      const filteredNodes = nds.filter((node) => node.id !== nodeId);
      console.log('Nodes after deletion:', filteredNodes.map(n => n.id));
      return filteredNodes;
    });
    // 同时删除与该节点相关的边
    setEdges((eds) => {
      const filteredEdges = eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      return filteredEdges;
    });
    // 从校验失败列表中移除该节点
    setInvalidNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, [setNodes, setEdges]);

  // 处理边删除
  const handleEdgeDelete = useCallback((edgeId: string) => {
    console.log('handleEdgeDelete called with edgeId:', edgeId);
    setEdges((eds) => {
      console.log('Current edges before deletion:', eds.map(e => e.id));
      const filteredEdges = eds.filter((edge) => edge.id !== edgeId);
      console.log('Edges after deletion:', filteredEdges.map(e => e.id));
      return filteredEdges;
    });
  }, [setEdges]);

  // 在线路上插入一个节点（替换当前边为两条边）
  const handleInsertNode = useCallback((edgeId: string, nodeType: string) => {
    setEdges((currentEdges) => {
      const edge = currentEdges.find((e) => e.id === edgeId);
      if (!edge) return currentEdges;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return currentEdges;

      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;

      const newNode: Node = {
        id: generateId(nodeType),
        type: nodeType as any,
        position: {x: midX, y: midY},
        data: {
          name: '',
          properties: {}, // 始终创建 properties 对象
          onDelete: handleNodeDelete
        },
      };

      const firstEdge: CustomEdge = {
        id: generateId('SequenceFlow'),
        type: 'arrow',
        source: edge.source,
        target: newNode.id,
        sourceHandle: null,
        targetHandle: null,
        data: {
          conditionsequenceflow: '',
          defaultConditions: 'false',
          onDelete: handleEdgeDelete,
          onInsert: (id: string, t: string) => handleInsertNode(id, t)
        },
      };
      const secondEdge: CustomEdge = {
        id: generateId('SequenceFlow'),
        type: 'arrow',
        source: newNode.id,
        target: edge.target,
        sourceHandle: null,
        targetHandle: null,
        data: {
          conditionsequenceflow: '',
          defaultConditions: 'false',
          onDelete: handleEdgeDelete,
          onInsert: (id: string, t: string) => handleInsertNode(id, t)
        },
      };

      // 同步更新节点
      setNodes((nds) => [...nds, newNode]);

      // 用两条新边替换旧边
      return [...currentEdges.filter((e) => e.id !== edgeId), firstEdge, secondEdge];
    });
  }, [nodes, handleEdgeDelete, handleNodeDelete, setEdges, setNodes]);

  // 解析flowModel数据并转换为ReactFlow格式
  const parseFlowModel = useCallback((flowModelStr: string) => {
    try {
      const flowModel = JSON.parse(flowModelStr);
      const {flowElementList} = flowModel;

      if (!flowElementList || !Array.isArray(flowElementList)) {
        return;
      }

      const parsedNodes: Node[] = [];
      const parsedEdges: CustomEdge[] = [];
      let positionX = 100;
      let positionY = 100;

      // 分离节点和边
      flowElementList.forEach((element: any) => {
        if (element.type === FlowElementType.SEQUENCE_FLOW) {
          // 这是边
          parsedEdges.push({
            id: element.key,
            type: 'arrow',
            source: element.incoming?.[0] || '',
            target: element.outgoing?.[0] || '',
            sourceHandle: null,
            targetHandle: null,
            data: {
              conditionsequenceflow: element.properties?.conditionsequenceflow || '',
              defaultConditions: element.properties?.defaultConditions || 'false',
              onDelete: handleEdgeDelete,
              onInsert: (edgeId: string, nodeType: string) => handleInsertNode(edgeId, nodeType),
            },
          });
        } else {
          // 这是节点
          const nodeType = getNodeTypeFromFlowElementType(element.type);

          // 从properties中读取位置信息，如果没有则使用默认布局
          const nodePositionX = element.properties?.positionX ?? positionX;
          const nodePositionY = element.properties?.positionY ?? positionY;

          parsedNodes.push({
            id: element.key,
            type: nodeType,
            position: {x: nodePositionX, y: nodePositionY},
            data: {
              name: element.properties?.name || '',
              properties: element.properties || {}, // 保持 properties 作为嵌套对象
              onDelete: () => {
              }, // 临时空函数，避免类型错误
            },
          });

          // 简单的位置布局（仅在没有保存位置时使用）
          if (element.properties?.positionX === undefined && element.properties?.positionY === undefined) {
            positionX += 200;
            if (positionX > 1000) {
              positionX = 100;
              positionY += 150;
            }
          }
        }
      });

      setNodes(parsedNodes);
      setEdges(parsedEdges);
    } catch (error) {
      console.error('解析flowModel失败:', error);
      message.error('解析流程模型失败');
    }
  }, [setNodes, setEdges, handleEdgeDelete, handleInsertNode]);

  // 加载流程详情
  const loadFlowDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const detail = await getFlowModule(projectId, id);
      setFlowName(detail.flowName);
      setFlowKey(detail.flowKey || '');
      setFlowRemark(detail.remark || '');

      // 如果有flowModel数据，解析并转换为ReactFlow格式
      if (detail.flowModel) {
        parseFlowModel(detail.flowModel);
      }
    } catch (error) {
      console.error('加载流程详情失败:', error);
      message.error('加载流程详情失败');
    } finally {
      setLoading(false);
    }
  }, [parseFlowModel]);

  // 初始化模式
  useEffect(() => {
    if (!hasInitialized.current && routeFlowModuleId) {
      hasInitialized.current = true;

      setFlowModuleId(routeFlowModuleId);
      loadFlowDetail(routeFlowModuleId);
    } else if (!hasInitialized.current && !routeFlowModuleId) {
      // 如果没有flowModuleId参数，重定向到流程列表
      hasInitialized.current = true;
      navigate('/flow');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeFlowModuleId]); // 移除loadFlowDetail依赖，避免循环

  // 初始化默认节点（仅在非编辑模式下）
  useEffect(() => {
    if (nodes.length === 0) {
      const startId = 'start-node';
      const endId = 'end-node';
      const defaultNodes: Node[] = [
        {
          id: startId,
          type: 'startEvent',
          position: {x: 100, y: 100},
          data: {
            name: '开始',
            properties: {}, // 始终创建 properties 对象
            onDelete: handleNodeDelete
          },
        },
        {
          id: endId,
          type: 'endEvent',
          position: {x: 400, y: 100},
          data: {
            name: '结束',
            properties: {}, // 始终创建 properties 对象
            onDelete: handleNodeDelete
          },
        },
      ];
      setNodes(defaultNodes);
      setEdges([{
        id: generateId('SequenceFlow'),
        type: 'arrow',
        source: startId,
        target: endId,
        sourceHandle: null,
        targetHandle: null,
        data: {
          conditionsequenceflow: '',
          defaultConditions: 'false',
          onDelete: handleEdgeDelete,
          onInsert: (id: string, t: string) => handleInsertNode(id, t)
        },
      } as CustomEdge]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]); // 简化依赖，避免循环

  // 为节点和边添加回调函数（使用useEffect确保在解析后添加）
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onDelete: handleNodeDelete,
          },
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]); // 只在节点数量变化时执行

  useEffect(() => {
    if (edges.length > 0) {
      setEdges((currentEdges) =>
        currentEdges.map((edge) => ({
          ...edge,
          data: {
            ...edge.data,
            onDelete: handleEdgeDelete,
            onInsert: (edgeId: string, nodeType: string) => handleInsertNode(edgeId, nodeType),
          },
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges.length]); // 只在边数量变化时执行

  // 处理节点连接
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: CustomEdge = {
        ...params,
        id: generateId('SequenceFlow'),
        type: 'arrow' as const,
        data: {
          conditionsequenceflow: '',
          defaultConditions: 'false',
          onDelete: handleEdgeDelete,
          onInsert: (edgeId: string, nodeType: string) => handleInsertNode(edgeId, nodeType),
        },
      };
      setEdges((eds) => addEdge(newEdge as any, eds as any) as any);
    },
    [setEdges, handleEdgeDelete, handleInsertNode]
  );

  // 处理节点选择
  const onNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
    // 如果当前有选中的节点，先校验当前节点
    if (selectedNode && selectedNode.id !== node.id && propertyPanelRef.current) {
      await propertyPanelRef.current.validateCurrentNode();
      // 无论校验是否通过，都允许切换（只是标记状态）
    }

    setSelectedNode(node);
    setSelectedEdge(null);
    setPropertyPanelVisible(true);
  }, [selectedNode]);

  // 处理边选择
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: CustomEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setPropertyPanelVisible(true);
  }, []);

  // 处理画布点击
  const onPaneClick = useCallback(async () => {
    // 如果当前有选中的节点，先校验
    if (selectedNode && propertyPanelRef.current) {
      await propertyPanelRef.current.validateCurrentNode();
    }

    setSelectedNode(null);
    setSelectedEdge(null);
    setPropertyPanelVisible(false);
  }, [selectedNode]);

  // 处理画布拖拽放置
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const dragDataStr = event.dataTransfer.getData('application/reactflow');
      if (!dragDataStr) return;

      let nodeType: string;
      let subType: string | undefined;

      try {
        // 尝试解析新的JSON格式
        const dragData = JSON.parse(dragDataStr);
        nodeType = dragData.nodeType;
        subType = dragData.subType;
      } catch {
        // 兼容旧的字符串格式
        nodeType = dragDataStr;
      }

      const point = reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({x: event.clientX, y: event.clientY})
        : {x: event.clientX - 280, y: event.clientY - 64};

      const newNode: Node = {
        id: generateId(nodeType),
        type: nodeType,
        position: point,
        data: {
          name: '',
          properties: subType ? {subType} : {}, // 始终创建 properties 对象
          onDelete: handleNodeDelete,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, handleNodeDelete]
  );

  // 处理拖拽悬停
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // 保存流程
  const handleSave = useCallback(async () => {
    // 清理无效的节点ID（那些已经不存在的节点）
    const validNodeIds = new Set(nodes.map(n => n.id));
    const cleanedInvalidNodeIds = new Set(Array.from(invalidNodeIds).filter(id => validNodeIds.has(id)));
    
    // 如果清理后的无效节点ID集合与原来的不同，更新状态
    if (cleanedInvalidNodeIds.size !== invalidNodeIds.size) {
      setInvalidNodeIds(cleanedInvalidNodeIds);
    }
    
    // 检查是否有校验失败的节点
    if (cleanedInvalidNodeIds.size > 0) {
      message.error(`有${cleanedInvalidNodeIds.size}个节点配置不完整`);
      return;
    }

    // 如果当前有选中的节点，先校验
    if (selectedNode && propertyPanelRef.current) {
      const isValid = await propertyPanelRef.current.validateCurrentNode();
      if (!isValid) {
        message.error('当前节点校验失败，请修正后再保存');
        return;
      }
    }
    
    // 重新校验所有节点，确保状态同步
    const currentInvalidNodes = new Set<string>();
    for (const node of nodes) {
      // 这里可以添加更详细的校验逻辑
      // 目前只检查是否有必填字段缺失
      if (node.type === 'serviceTask') {
        const subType = (node.data?.properties as any)?.subType;
        if (subType === 'sql') {
          const datasourceName = (node.data?.properties as any)?.datasourceName;
          const script = (node.data?.properties as any)?.script;
          if (!datasourceName || !script) {
            currentInvalidNodes.add(node.id);
          }
        } else if (subType === 'insert_record' || subType === 'update_record' || subType === 'delete_record' || subType === 'query_record') {
          const datasourceName = (node.data?.properties as any)?.datasourceName;
          const modelName = (node.data?.properties as any)?.modelName;
          if (!datasourceName || !modelName) {
            currentInvalidNodes.add(node.id);
          }
        } else if (subType === 'api') {
          const method = (node.data?.properties as any)?.method;
          const url = (node.data?.properties as any)?.url;
          if (!method || !url) {
            currentInvalidNodes.add(node.id);
          }
        }
      }
    }
    
    // 更新校验状态
    setInvalidNodeIds(currentInvalidNodes);
    
    // 如果还有校验失败的节点，阻止保存
    if (currentInvalidNodes.size > 0) {
      message.error(`有${currentInvalidNodes.size}个节点配置不完整，请修正后再保存`);
      return;
    }

    const flowModel = {
      flowElementList: [
        ...nodes.map(node => {
          // 始终使用当前节点的实际位置（node.position），这是最新的位置
          const properties = {
            ...(node.data?.properties || {}),
            positionX: Math.round(node.position.x),
            positionY: Math.round(node.position.y),
          };

          return {
            key: node.id,
            type: getNodeType(node.type || 'userTask'),
            incoming: edges.filter(edge => edge.target === node.id).map(edge => edge.id),
            outgoing: edges.filter(edge => edge.source === node.id).map(edge => edge.id),
            properties: properties,
          };
        }),
        ...edges.map(edge => ({
          key: edge.id,
          type: FlowElementType.SEQUENCE_FLOW,
          incoming: [edge.source],
          outgoing: [edge.target],
          properties: edge.data || {},
        })),
      ],
    };

    if (flowModuleId) {
      // 更新现有流程
      try {
        const updateData: UpdateFlowRequest = {
          flowName: flowName,
          flowKey: flowKey,
          remark: flowRemark,
          flowModel: JSON.stringify(flowModel),
        };
        await updateFlow(projectId, flowModuleId, updateData);
        message.success('流程更新成功');
      } catch (error) {
        console.error('更新流程失败:', error);
        message.error('更新流程失败');
      }
    } else {
      message.error('流程ID不存在，无法保存');
    }
  }, [nodes, edges, flowModuleId, flowName, flowKey, flowRemark, invalidNodeIds, selectedNode]);

  // 发布流程
  const handleDeploy = useCallback(async () => {
    if (!flowModuleId) {
      message.error('流程ID不存在，无法发布');
      return;
    }

    // 清理无效的节点ID（那些已经不存在的节点）
    const validNodeIds = new Set(nodes.map(n => n.id));
    const cleanedInvalidNodeIds = new Set(Array.from(invalidNodeIds).filter(id => validNodeIds.has(id)));
    
    // 如果清理后的无效节点ID集合与原来的不同，更新状态
    if (cleanedInvalidNodeIds.size !== invalidNodeIds.size) {
      setInvalidNodeIds(cleanedInvalidNodeIds);
    }
    
    // 检查是否有校验失败的节点
    if (cleanedInvalidNodeIds.size > 0) {
      console.log('校验失败的节点ID:', Array.from(cleanedInvalidNodeIds));
      console.log('当前所有节点ID:', nodes.map(n => n.id));
      message.error(`有${cleanedInvalidNodeIds.size}个节点配置不完整，请修正后再发布`);
      return;
    }

    // 如果当前有选中的节点，先校验
    if (selectedNode && propertyPanelRef.current) {
      const isValid = await propertyPanelRef.current.validateCurrentNode();
      if (!isValid) {
        message.error('当前节点校验失败，请修正后再发布');
        return;
      }
    }
    
    // 重新校验所有节点，确保状态同步
    const currentInvalidNodes = new Set<string>();
    for (const node of nodes) {
      // 这里可以添加更详细的校验逻辑
      // 目前只检查是否有必填字段缺失
      if (node.type === 'serviceTask') {
        const subType = (node.data?.properties as any)?.subType;
        if (subType === 'sql') {
          const datasourceName = (node.data?.properties as any)?.datasourceName;
          const script = (node.data?.properties as any)?.script;
          if (!datasourceName || !script) {
            currentInvalidNodes.add(node.id);
          }
        } else if (subType === 'insert_record' || subType === 'update_record' || subType === 'delete_record' || subType === 'query_record') {
          const datasourceName = (node.data?.properties as any)?.datasourceName;
          const modelName = (node.data?.properties as any)?.modelName;
          if (!datasourceName || !modelName) {
            currentInvalidNodes.add(node.id);
          }
        } else if (subType === 'api') {
          const method = (node.data?.properties as any)?.method;
          const url = (node.data?.properties as any)?.url;
          if (!method || !url) {
            currentInvalidNodes.add(node.id);
          }
        }
      }
    }
    
    // 更新校验状态
    setInvalidNodeIds(currentInvalidNodes);
    
    // 如果还有校验失败的节点，阻止发布
    if (currentInvalidNodes.size > 0) {
      message.error(`有${currentInvalidNodes.size}个节点配置不完整，请修正后再发布`);
      return;
    }

    const flowModel = {
      flowElementList: [
        ...nodes.map(node => ({
          key: node.id,
          type: getNodeType(node.type || 'userTask'),
          incoming: edges.filter(edge => edge.target === node.id).map(edge => edge.id),
          outgoing: edges.filter(edge => edge.source === node.id).map(edge => edge.id),
          properties: {
            ...(node.data?.properties || {}),
            positionX: Math.round(node.position.x),
            positionY: Math.round(node.position.y),
          },
        })),
        ...edges.map(edge => ({
          key: edge.id,
          type: FlowElementType.SEQUENCE_FLOW,
          incoming: [edge.source],
          outgoing: [edge.target],
          properties: edge.data || {},
        })),
      ],
    };

    try {
      const updateData: UpdateFlowRequest = {
        flowName,
        flowKey,
        remark: flowRemark,
        flowModel: JSON.stringify(flowModel),
      };
      await updateFlow(projectId, flowModuleId, updateData);
      const res = await deployFlow(projectId, flowModuleId, {flowModuleId});
      if (res?.flowDeployId) {
        message.success('发布成功');
      } else {
        message.warning('发布已提交');
      }
    } catch (e) {
      console.error('发布流程失败:', e);
      message.error('发布失败');
    }
  }, [edges, flowKey, flowModuleId, flowName, flowRemark, nodes, invalidNodeIds, selectedNode]);

  // moved above

  return (
    <PageContainer
      loading={loading}
      bodyStyle={{padding: 0}}
      title={<Space>
        <Button
          icon={<ArrowLeftOutlined/>}
          onClick={() => navigate(-1)}
          title="返回上一页"
        />
        {flowName}
        <Button
          type="text"
          icon={<SettingOutlined/>}
          onClick={() => setSettingsPanelVisible(true)}
          title="流程设置"
        /></Space>
      }
      extra={
        <Space>
          <Button onClick={handleDeploy}>发布</Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <ReactFlowProvider>
        <Layout style={{height: '100%'}}>
          {/* 左侧节点面板 */}
          <Sider
            width={280}
            collapsed={leftPanelCollapsed}
            collapsedWidth={0}
            style={{
              background: 'var(--ant-color-bg-container)',
              borderRight: '1px solid var(--ant-color-border)'
            }}
          >
            <NodePanel onHide={() => setLeftPanelCollapsed(true)}/>
          </Sider>

          {/* 中间画布区域 */}
          <Content style={{position: 'relative'}}>
            {/* 左侧面板隐藏时的提示按钮 */}
            {leftPanelCollapsed && (
              <Button
                type="primary"
                icon={<MenuUnfoldOutlined/>}
                onClick={() => setLeftPanelCollapsed(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
                title="显示节点面板"
              >
                节点面板
              </Button>
            )}

            <ReactFlow
              nodes={nodes.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  hasError: invalidNodeIds.has(node.id) // 传递校验失败状态
                }
              }))}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={(instance) => setReactFlowInstance(instance as any)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[16, 16]}
              proOptions={{hideAttribution: true}}
            >
              <Background/>
              <MiniMap style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowSecondary as string
              }}
                       zoomable
                       pannable
                       nodeColor={() => token.colorTextTertiary}
                       nodeStrokeColor={() => token.colorTextSecondary}
                       maskColor={token.colorFillSecondary as string}/>
            </ReactFlow>
          </Content>

        </Layout>

        {/* 属性配置面板 - Drawer */}
        <PropertyPanel
          ref={propertyPanelRef}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          visible={propertyPanelVisible}
          onClose={async () => {
            // 关闭前先校验当前节点
            if (selectedNode && propertyPanelRef.current) {
              await propertyPanelRef.current.validateCurrentNode();
            }
            setPropertyPanelVisible(false);
          }}
          onValidationChange={(nodeId, isValid) => {
            setInvalidNodeIds(prev => {
              const next = new Set(prev);
              if (isValid) {
                next.delete(nodeId);
              } else {
                next.add(nodeId);
              }
              return next;
            });
          }}
          onNodePropertyChange={(nodeId, properties) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  // 正确合并节点数据，保留原有的properties
                  const updatedNode = {
                    ...node,
                    data: {
                      ...node.data,
                      ...properties,
                      // 确保properties字段被正确合并而不是覆盖
                      properties: {
                        ...(node.data?.properties || {}),
                        ...(properties.properties || {})
                      }
                    }
                  };

                  // 如果properties中包含坐标信息，更新节点位置
                  if (properties.positionX !== undefined || properties.positionY !== undefined) {
                    updatedNode.position = {
                      x: properties.positionX !== undefined ? properties.positionX : node.position.x,
                      y: properties.positionY !== undefined ? properties.positionY : node.position.y,
                    };
                  }

                  // 如果properties中包含尺寸信息，更新节点尺寸
                  if (properties.width !== undefined || properties.height !== undefined) {
                    updatedNode.style = {
                      ...updatedNode.style,
                      width: properties.width !== undefined ? properties.width : node.style?.width,
                      height: properties.height !== undefined ? properties.height : node.style?.height,
                    };
                  }

                  return updatedNode;
                }
                return node;
              })
            );
          }}
          onEdgePropertyChange={(edgeId, data) => {
            setEdges((eds) =>
              eds.map((edge) => {
                if (edge.id === edgeId) {
                  return {
                    ...edge,
                    data: {
                      ...edge.data,
                      ...data,
                    },
                  };
                }
                return edge;
              })
            );
            // 更新当前选中的边
            setSelectedEdge((prevEdge) => {
              if (prevEdge && prevEdge.id === edgeId) {
                return {
                  ...prevEdge,
                  data: {
                    ...prevEdge.data,
                    ...data,
                  },
                };
              }
              return prevEdge;
            });
          }}
          nodes={nodes}
        />

        {/* 流程设置面板 */}
        <FlowSettingsPanel
          visible={settingsPanelVisible}
          onClose={() => setSettingsPanelVisible(false)}
          flowName={flowName}
          flowKey={flowKey}
          flowRemark={flowRemark}
          onFlowNameChange={setFlowName}
          onFlowKeyChange={setFlowKey}
          onFlowRemarkChange={setFlowRemark}
        />
      </ReactFlowProvider>
    </PageContainer>
  );
};

// 辅助函数：将节点类型转换为FlowElementType
function getNodeType(nodeType: string): FlowElementType {
  const typeMap: Record<string, FlowElementType> = {
    startEvent: FlowElementType.START_EVENT,
    endEvent: FlowElementType.END_EVENT,
    userTask: FlowElementType.USER_TASK,
    serviceTask: FlowElementType.SERVICE_TASK,
    exclusiveGateway: FlowElementType.EXCLUSIVE_GATEWAY,
    parallelGateway: FlowElementType.PARALLEL_GATEWAY,
    inclusiveGateway: FlowElementType.INCLUSIVE_GATEWAY,
  };
  return typeMap[nodeType] || FlowElementType.USER_TASK;
}

export default FlowDesign;
