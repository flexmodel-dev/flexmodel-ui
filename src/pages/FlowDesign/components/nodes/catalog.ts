import {NodeType} from '../../types/flow.d';

export type NodeCategory = 'events' | 'activities' | 'serviceTasks' | 'gateways' | 'advanced';

export interface NodeCatalogItem {
  type: NodeType;
  label: string;
  icon: string;
  category: NodeCategory;
  subType?: string; // 用于区分自动节点的细分类型
}

// 统一节点目录：左侧面板与连线"+"菜单共用
export const nodeCatalog: NodeCatalogItem[] = [

  // 人工节点
  { type: 'userTask', label: '提交节点', icon: 'user-task', category: 'activities' },

  // 自动节点
  { type: 'serviceTask', label: '新增记录', icon: 'add-record', category: 'serviceTasks', subType: 'insert_record' },
  { type: 'serviceTask', label: '更新记录', icon: 'update-record', category: 'serviceTasks', subType: 'update_record' },
  { type: 'serviceTask', label: '查询记录', icon: 'query-record', category: 'serviceTasks', subType: 'query_record' },
  { type: 'serviceTask', label: '删除记录', icon: 'delete-record', category: 'serviceTasks', subType: 'delete_record' },
  { type: 'serviceTask', label: '执行脚本', icon: 'js-script', category: 'serviceTasks', subType: 'script' },
  { type: 'serviceTask', label: '执行SQL', icon: 'sql', category: 'serviceTasks', subType: 'sql' },
  { type: 'serviceTask', label: '调用云函数', icon: 'cloud-function', category: 'serviceTasks', subType: 'cloud_function' },

  // 网关节点
  { type: 'exclusiveGateway', label: '排他网关', icon: 'gateway-exclusive', category: 'gateways' },
  { type: 'parallelGateway', label: '并行网关', icon: 'gateway-parallel', category: 'gateways' },
  { type: 'inclusiveGateway', label: '包容网关', icon: 'gateway-inclusive', category: 'gateways' },

  // 事件节点
  { type: 'startEvent', label: '开始事件', icon: 'start-event', category: 'events' },
  { type: 'endEvent', label: '结束事件', icon: 'end-event', category: 'events' },

  // 高级
  { type: 'callActivity', label: '子流程', icon: 'call-service', category: 'advanced' },
];

export const categoryTitle: Record<NodeCategory, string> = {
  events: '事件节点',
  activities: '人工节点',
  serviceTasks: '自动节点',
  gateways: '网关节点',
  advanced: '高级',
};


