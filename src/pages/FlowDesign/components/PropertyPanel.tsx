import React, {forwardRef, useImperativeHandle} from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popover,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Typography
} from 'antd';
const { TextArea } = Input;
import {CloseOutlined, CodeOutlined, PlusOutlined} from '@ant-design/icons';
import {Edge, Node} from '@xyflow/react';
import ScriptEditorModal from '../../../components/common/ScriptEditorModal';
import FieldMappingComponent from '../../../components/common/FieldMappingComponent';
import {getModelList} from '@/services/model';
import {getApis} from '@/services/api-info';
import {EntitySchema, EnumSchema, NativeQuerySchema} from '@/types/data-modeling';
import {useProject} from '@/store/appStore';

const { Option } = Select;

interface HeaderItem {
  key: string;
  value: string;
}

interface HeadersComponentProps {
  value?: HeaderItem[];
  onChange?: (value: HeaderItem[]) => void;
}

const HeadersComponent: React.FC<HeadersComponentProps> = ({
  value = [],
  onChange,
}) => {
  const handleAdd = () => {
    const newHeader: HeaderItem = { key: '', value: '' };
    onChange?.([...value, newHeader]);
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange?.(newValue);
  };

  const handleKeyChange = (index: number, key: string) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], key };
    onChange?.(newValue);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedValue = [...value];
    updatedValue[index] = { ...updatedValue[index], value: newValue };
    onChange?.(updatedValue);
  };

  return (
    <div>
      {value.map((header, index) => (
        <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input
            placeholder="请求头名称"
            value={header.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            style={{ flex: 1 }}
          />
          <span style={{ color: '#666' }}>=</span>
          <Input
            placeholder="请求头值，支持变量如 ${token}"
            value={header.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            style={{ flex: 2 }}
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => handleRemove(index)}
            size="small"
            style={{ color: '#ff4d4f' }}
          />
        </div>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ width: '100%', marginTop: 8 }}
      >
        新增请求头
      </Button>
    </div>
  );
};

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

interface PropertyPanelProps {
  selectedNode: Node | null;
  selectedEdge: CustomEdge | null;
  visible: boolean;
  onClose: () => void;
  onNodePropertyChange: (nodeId: string, properties: Record<string, any>) => void;
  onEdgePropertyChange: (edgeId: string, data: Record<string, any>) => void;
  nodes: Node[];
  onValidationChange: (nodeId: string, isValid: boolean) => void;
}

export interface PropertyPanelRef {
  validateCurrentNode: () => Promise<boolean>;
}

const PropertyPanel = forwardRef<PropertyPanelRef, PropertyPanelProps>(({
  selectedNode,
  selectedEdge,
  visible,
  onClose,
  onNodePropertyChange,
  onEdgePropertyChange,
  nodes,
  onValidationChange,
}, ref) => {
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [form] = Form.useForm();
  const [nodeProperties, setNodeProperties] = React.useState<Record<string, any>>({});
  const [models, setModels] = React.useState<(EntitySchema | EnumSchema | NativeQuerySchema)[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<EntitySchema | null>(null);
  const [apiList, setApiList] = React.useState<any[]>([]);
  const [scriptEditorVisible, setScriptEditorVisible] = React.useState(false);
  const [sqlEditorVisible, setSqlEditorVisible] = React.useState(false);

  const handleScriptChange = (value: string) => {
    form.setFieldValue(['properties', 'script'], value);
    handleFormChange({ properties: { script: value } }, form.getFieldsValue());
  };

  const handleSqlChange = (value: string) => {
    form.setFieldValue(['properties', 'script'], value);
    handleFormChange({ properties: { script: value } }, form.getFieldsValue());
  };

  useImperativeHandle(ref, () => ({
    validateCurrentNode: async () => {
      if (!selectedNode) {
        return true;
      }

      try {
        await form.validateFields();
        onValidationChange(selectedNode.id, true);
        return true;
      } catch (error) {
        console.log('节点校验失败:', selectedNode.id, error);
        onValidationChange(selectedNode.id, false);
        return false;
      }
    }
  }), [selectedNode, form, onValidationChange]);

  React.useEffect(() => {
    if (selectedNode) {
      const baseProperties = (selectedNode.data?.properties as any) || {};
      const properties = {
        name: selectedNode.data?.name,
        positionX: Math.round(selectedNode.position.x),
        positionY: Math.round(selectedNode.position.y),
        ...baseProperties,
      } as any;

      const processedProperties = { ...baseProperties };
      if (processedProperties.document && Array.isArray(processedProperties.document)) {
        processedProperties.document = convertArrayToFieldMapping(processedProperties.document);
      }

      form.setFieldsValue({
        ...selectedNode.data,
        id: selectedNode.id,
        type: selectedNode.type,
        positionX: properties.positionX ?? Math.round(selectedNode.position.x),
        positionY: properties.positionY ?? Math.round(selectedNode.position.y),
        width: selectedNode.style?.width || 120,
        height: selectedNode.style?.height || 60,
        enabled: selectedNode.data?.enabled !== false,
        properties: processedProperties,
      });
      setNodeProperties(properties);
    } else if (selectedEdge) {
      form.setFieldsValue({
        edgeId: selectedEdge.id,
        sourceNode: selectedEdge.source,
        targetNode: selectedEdge.target,
        conditionsequenceflow: selectedEdge.data?.conditionsequenceflow || '',
        defaultConditions: selectedEdge.data?.defaultConditions || 'false',
      });
    } else {
      form.resetFields();
      setNodeProperties({});
    }
  }, [selectedNode, selectedEdge, form]);

  React.useEffect(() => {
    const fetchApis = async () => {
      if (!projectId) {
        setApiList([]);
        return;
      }

      try {
        const apis = await getApis(projectId);
        setApiList(apis);
      } catch (error) {
        console.error('获取API列表失败:', error);
      }
    };
    fetchApis();
  }, [projectId]);

  React.useEffect(() => {
    if (!projectId) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      try {
        const modelList = await getModelList(projectId);
        const entityModels = modelList.filter(model => model.type === 'entity');
        setModels(entityModels);
      } catch (error) {
        console.error('获取模型列表失败:', error);
        setModels([]);
      }
    };
    fetchModels();
  }, [projectId]);

  React.useEffect(() => {
    if (selectedNode && selectedNode.type === 'serviceTask') {
      const modelName = (selectedNode.data?.properties as any)?.modelName;

      if (modelName && models.length > 0) {
        const model = models.find(m => m.name === modelName) as EntitySchema;
        setSelectedModel(model || null);
      }
    }
  }, [selectedNode, models]);

  const handleModelChange = (modelName: string) => {
    const model = models.find(m => m.name === modelName) as EntitySchema;
    setSelectedModel(model || null);
  };

  const getAllApis = (apis: any[]): any[] => {
    const result: any[] = [];
    const traverse = (items: any[]) => {
      items.forEach(item => {
        if (item.type === 'API') {
          result.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(apis);
    return result;
  };

  const handleApiChange = (apiId: string) => {
    const allApis = getAllApis(apiList);
    const selectedApi = allApis.find(api => api.id === apiId);
    if (selectedApi) {
      form.setFieldsValue({
        properties: {
          ...form.getFieldValue('properties'),
          method: selectedApi.method,
          url: selectedApi.path
        }
      });
    }
  };

  const convertFieldMappingToArray = (fieldMappings: any[]) => {
    if (!fieldMappings || fieldMappings.length === 0) return [];
    return fieldMappings.filter(mapping => mapping.field && mapping.value !== undefined);
  };

  const convertArrayToFieldMapping = (arrayData: any[]) => {
    if (!arrayData || !Array.isArray(arrayData)) return [];
    return arrayData.map(item => ({
      field: item.field || '',
      value: String(item.value || '')
    }));
  };

  const handleFormChange = (_changedValues: any, allValues: any) => {
    if (selectedNode) {
      const processedProperties = { ...(allValues.properties || {}) };
      if (processedProperties.document && Array.isArray(processedProperties.document)) {
        processedProperties.document = convertFieldMappingToArray(processedProperties.document);
      }

      const nextProps = {
        ...(selectedNode.data?.properties as any || {}),
        ...processedProperties,
        name: allValues.name,
        positionX: allValues.positionX,
        positionY: allValues.positionY,
      } as any;
      setNodeProperties(nextProps);

      onNodePropertyChange(selectedNode.id, {
        name: allValues.name,
        positionX: allValues.positionX,
        positionY: allValues.positionY,
        properties: nextProps
      });
    } else if (selectedEdge) {
      onEdgePropertyChange(selectedEdge.id, {
        conditionsequenceflow: allValues.conditionsequenceflow || '',
        defaultConditions: allValues.defaultConditions || 'false',
      });
    }
  };

  const renderServiceTaskProperties = () => {
    const subType = (selectedNode?.data?.properties as any)?.subType;

    switch (subType) {
      case 'script':
        return (
          <>
            <Form.Item label="脚本内容" name={['properties', 'script']} rules={[{ required: true, message: '请输入脚本内容' }]}>
              <div style={{position: 'relative'}}>
                <TextArea
                  readOnly
                  size="large"
                  rows={3}
                  value={nodeProperties?.script || ""}
                  placeholder="双击或者点击按钮输入脚本内容"
                  onDoubleClick={() => setScriptEditorVisible(true)}
                  style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
                />
                <Tooltip title="打开脚本编辑器">
                  <Button
                    type="text"
                    icon={<CodeOutlined/>}
                    onClick={() => setScriptEditorVisible(true)}
                    style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
                  />
                </Tooltip>
              </div>
            </Form.Item>
          </>
        );

      case 'sql':
        return (
          <>
            <Form.Item label="执行SQL" name={['properties', 'script']} rules={[{ required: true, message: '请输入SQL' }]}>
              <div style={{position: 'relative'}}>
                <TextArea
                  readOnly
                  size="large"
                  rows={3}
                  value={nodeProperties?.script || ""}
                  placeholder="双击或者点击按钮输入SQL"
                  onDoubleClick={() => setSqlEditorVisible(true)}
                  style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
                />
                <Tooltip title="打开SQL编辑器">
                  <Button
                    type="text"
                    icon={<CodeOutlined/>}
                    onClick={() => setSqlEditorVisible(true)}
                    style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
                  />
                </Tooltip>
              </div>
            </Form.Item>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: queryResult" />
            </Form.Item>
          </>
        );

      case 'insert_record':
        return (
          <>
            <Form.Item
              label="输入数据路径"
              name={['properties', 'inputPath']}
            >
              <Input placeholder="非必填，更新多条记录时可使用，例如: arrayData" />
            </Form.Item>
            <Form.Item
              label="模型"
              name={['properties', 'modelName']}
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select
                placeholder="请选择模型"
                onChange={handleModelChange}
              >
                {models.map(model => (
                  <Option key={model.name} value={model.name}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="数据映射"
              name={['properties', 'document']}
              rules={[{ required: true, message: '请输入记录数据' }]}
            >
              <FieldMappingComponent
                placeholder={{
                  field: '字段名',
                  value: '字段值，支持变量如 ${user.name}'
                }}
                fieldOptions={selectedModel?.fields || []}
              />
            </Form.Item>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: affectedRows" />
            </Form.Item>
          </>
        );

      case 'update_record':
        return (
          <>
            <Form.Item
              label="输入数据路径"
              name={['properties', 'inputPath']}
            >
              <Input placeholder="非必填，更新多条记录时可使用，例如: arrayData" />
            </Form.Item>
            <Form.Item
              label="模型"
              name={['properties', 'modelName']}
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select
                placeholder="请选择模型"
                onChange={handleModelChange}
              >
                {models.map(model => (
                  <Option key={model.name} value={model.name}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="数据映射"
              name={['properties', 'document']}
              rules={[{ required: true, message: '请输入更新数据' }]}
            >
              <FieldMappingComponent
                placeholder={{
                  field: '字段名',
                  value: '新值，支持变量如 ${newValue}'
                }}
                fieldOptions={selectedModel?.fields || []}
              />
            </Form.Item>
            <Form.Item
              label="过滤条件"
              name={['properties', 'filter']}
            >
              <Input.TextArea
                placeholder='{"field": {"_eq": "value"}}'
                rows={4}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px'
                }}
              />
            </Form.Item>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: affectedRows" />
            </Form.Item>
          </>
        );

      case 'delete_record':
        return (
          <>
            <Form.Item
              label="模型"
              name={['properties', 'modelName']}
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select
                placeholder="请选择模型"
              >
                {models.map(model => (
                  <Option key={model.name} value={model.name}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="过滤条件"
              name={['properties', 'filter']}
            >
              <Input.TextArea
                placeholder='{"field": {"_eq": "value"}}'
                rows={4}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px'
                }}
              />
            </Form.Item>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: affectedRows" />
            </Form.Item>
          </>
        );

      case 'query_record':
        return (
          <>
            <Form.Item
              label="模型"
              name={['properties', 'modelName']}
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select
                placeholder="请选择模型"
              >
                {models.map(model => (
                  <Option key={model.name} value={model.name}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="过滤条件"
              name={['properties', 'filter']}
            >
              <Input.TextArea
                placeholder='{"field": {"_eq": "value"}}'
                rows={4}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px'
                }}
              />
            </Form.Item>
            <Form.Item
              label="排序配置"
              name={['properties', 'sort']}
            >
              <Input.TextArea
                placeholder='[{"field": "createdAt", "order": "desc"}]'
                rows={3}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px'
                }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="页码"
                  name={['properties', 'page']}
                >
                  <InputNumber
                    placeholder="第几页"
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="每页大小"
                  name={['properties', 'size']}
                >
                  <InputNumber
                    placeholder="每页条数"
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: records" />
            </Form.Item>
          </>
        );

      case 'api': {
        const allApis = getAllApis(apiList);
        return (
          <>
            <Form.Item
              label="选择API"
              name={['properties', 'apiId']}
            >
              <Select
                placeholder="请选择内置API（可选）"
                allowClear
                onChange={handleApiChange}
              >
                {allApis.map(api => (
                  <Option key={api.id} value={api.id}>
                    {api.method} {api.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="方法"
                  name={['properties', 'method']}
                  rules={[{ required: true, message: '请选择HTTP方法' }]}
                >
                  <Select placeholder="请选择HTTP方法">
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="PATCH">PATCH</Option>
                    <Option value="DELETE">DELETE</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item
                  label="URL路径"
                  name={['properties', 'url']}
                  rules={[{ required: true, message: '请输入URL路径' }]}
                >
                  <Input placeholder="例如: /api/users" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="请求头"
              name={['properties', 'headers']}
            >
              <HeadersComponent />
            </Form.Item>
            <Form.Item
              label="请求体"
              name={['properties', 'body']}
            >
              <Input.TextArea
                placeholder='{"name": "${userName}", "age": 25}'
                rows={4}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '13px'
                }}
              />
            </Form.Item>
            <Form.Item
              label="结果存放路径"
              name={['properties', 'resultPath']}
            >
              <Input placeholder="例如: apiResponse" />
            </Form.Item>
          </>
        );
      }

      default:
        return (
          <></>
        );
    }
  };

  const getNodeName = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    return (node?.data?.name as string) || nodeId;
  };

  const isSourceNodeGateway = () => {
    if (!selectedEdge) return false;
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    if (!sourceNode) return false;
    return ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway'].includes(sourceNode.type || '');
  };

  const renderEdgeProperties = () => {
    if (!selectedEdge) return null;

    const isGateway = isSourceNodeGateway();

    return (
      <>
        <Card title="连线信息" size="small">
          <Form
            form={form}
            layout="vertical"
            size="small"
            onValuesChange={handleFormChange}
          >
            <Form.Item label="连线ID" name="edgeId">
              <Input disabled />
            </Form.Item>
            <Form.Item label="源节点" name="sourceNode">
              <Input
                disabled
                suffix={<span style={{ color: '#999', fontSize: '12px' }}>({getNodeName(selectedEdge.source)})</span>}
              />
            </Form.Item>
            <Form.Item label="目标节点" name="targetNode">
              <Input
                disabled
                suffix={<span style={{ color: '#999', fontSize: '12px' }}>({getNodeName(selectedEdge.target)})</span>}
              />
            </Form.Item>
          </Form>
        </Card>
        <Divider style={{ margin: '16px 0' }} />
        <Card title="连线条件" size="small">
          <Form
            form={form}
            layout="vertical"
            size="small"
            onValuesChange={handleFormChange}
          >
            {isGateway && (
              <>
                <Form.Item
                  label="条件表达式"
                  name="conditionsequenceflow"
                  tooltip="条件表达式，例如：${score > 60}，用于判断是否执行该路径"
                >
                  <Input.TextArea
                    placeholder="请输入条件表达式，例如：${score > 60}"
                    rows={4}
                    style={{
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '13px'
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="默认路径"
                  name="defaultConditions"
                  tooltip="是否为默认路径，当所有条件都不满足时执行默认路径"
                >
                  <Radio.Group>
                    <Radio value="true">是</Radio>
                    <Radio value="false">否</Radio>
                  </Radio.Group>
                </Form.Item>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  <p><strong>条件表达式说明：</strong></p>
                  <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                    <li>使用 ${'{'}expression{'}'} 格式编写条件</li>
                    <li>可以访问流程变量，如：${'{'} score {'>'} 60 {'}'}</li>
                    <li>支持比较运算符：{'>'}、{'<'}、==、!=、{'>'}=、{'<'}=</li>
                    <li>支持逻辑运算符：&&（与）、||（或）、!（非）</li>
                    <li>默认路径无需设置条件表达式</li>
                  </ul>
                </div>
              </>
            )}
            {!isGateway && (
              <div style={{ color: '#999', padding: '16px', textAlign: 'center' }}>
                普通连线无需设置条件
              </div>
            )}
          </Form>
        </Card>
      </>
    );
  };

  const renderNodeProperties = () => {

    const renderNodeSpecificProperties = () => {
      switch (selectedNode?.type) {
        case 'startEvent':
        case 'endEvent':
          return (
            <></>
          );

        case 'userTask':
          return (
            <></>
          );

        case 'serviceTask':
          return renderServiceTaskProperties();

        case 'exclusiveGateway':
        case 'parallelGateway':
        case 'inclusiveGateway':
          return (
            <>
              <Form.Item label="刷新数据Key" name="hookInfoIds">
                <Input placeholder="例如: [1,2]" />
              </Form.Item>
            </>
          );

        default:
          return (
            <></>
          );
      }
    };

    return (
      <>
        <Card title="基本信息" size="small">
          <Form
            form={form}
            layout="vertical"
            size="small"
            onValuesChange={handleFormChange}
          >
            <Form.Item label="节点ID" name="id">
              <Input disabled />
            </Form.Item>
            <Form.Item label="节点名称" name="name">
              <Input placeholder="请输入节点名称" />
            </Form.Item>
            <Form.Item name="positionX" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
            <Form.Item name="positionY" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
          </Form>
        </Card>
        <Divider style={{ margin: '16px 0' }} />
        <Card title="节点属性" size="small">
          <Form
            form={form}
            layout="vertical"
            size="small"
            onValuesChange={handleFormChange}
          >
            {renderNodeSpecificProperties()}
          </Form>
        </Card>
      </>
    );
  };

  return (
    <Drawer
      title={selectedEdge ? '连线属性' : form.getFieldValue('name')}
      extra={
        <Space align="center">
          <Popover
            content={
              <div>
                <Typography.Paragraph
                  copyable
                  style={{ whiteSpace: "pre-wrap", margin: "8px 0 0 0" }}
                >
                  {JSON.stringify(nodeProperties, null, 2)}
                </Typography.Paragraph>
              </div>
            }
            title="连线属性"
          >
            <Button icon={<CodeOutlined />} type="text" size="small" />
          </Popover>
        </Space>
      }
      placement="right"
      size={400}
      open={visible}
      onClose={onClose}
      destroyOnHidden={false}
      mask={false}
      style={{ position: 'absolute' }}
      getContainer={false}
    >
      <div style={{ height: '100%', overflow: 'auto' }}>
        {selectedEdge ? renderEdgeProperties() : renderNodeProperties()}
      </div>
      <ScriptEditorModal
        visible={scriptEditorVisible}
        value={nodeProperties?.script || ""}
        onChange={handleScriptChange}
        onClose={() => setScriptEditorVisible(false)}
        title="脚本编辑器"
        description="编辑 JavaScript 脚本内容"
      />
      <ScriptEditorModal
        visible={sqlEditorVisible}
        language="sql"
        value={nodeProperties?.script || ""}
        onChange={handleSqlChange}
        onClose={() => setSqlEditorVisible(false)}
        title="SQL 编辑器"
        description="编辑 SQL 查询语句"
      />
    </Drawer>
  );
});

export default PropertyPanel;
