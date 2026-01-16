import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Divider, Form, Input, InputNumber, Radio, Row, Select} from 'antd';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {INTERVAL_UNITS, MUTATION_TYPES, TRIGGER_TIMINGS, TriggerFormType} from '@/types/trigger';
import {TriggerDTO} from '@/services/trigger';
import {getDatasourceList} from '@/services/datasource';
import {getModelList} from '@/services/model';
import {FlowModule, getFlowList} from '@/services/flow';
import {DatasourceSchema} from '@/types/data-source';
import {EntitySchema, EnumSchema, NativeQuerySchema} from '@/types/data-modeling';
import {useProject} from '@/store/appStore';

const { Option } = Select;

export interface TriggerFormProps {
  /** 表单模式：create | edit | view */
  mode: 'create' | 'edit' | 'view';
  /** 编辑时的触发器数据 */
  trigger?: TriggerDTO;
  /** 外部Form实例 */
  form?: any;
  /** 提交回调 */
  onSubmit?: (values: any) => void;
  /** 数据源名称（从父组件传入，用于事件触发模式） */
  datasource?: string;
  /** 模型信息（从父组件传入，用于事件触发模式） */
  model?: EntitySchema;
  /** 是否只显示事件触发（隐藏定时触发选项） */
  eventOnly?: boolean;
}

const TriggerForm: React.FC<TriggerFormProps> = ({
  mode,
  trigger,
  form: externalForm,
  onSubmit,
  datasource,
  model,
  eventOnly = false
}) => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [triggerFormType, setTriggerFormType] = useState<TriggerFormType>(eventOnly ? 'event' : 'interval');
  const [datasources, setDatasources] = useState<DatasourceSchema[]>([]);
  const [models, setModels] = useState<(EntitySchema | EnumSchema | NativeQuerySchema)[]>([]);
  const [flows, setFlows] = useState<FlowModule[]>([]);
  const [selectedDatasource, setSelectedDatasource] = useState<string>('');

  // 获取数据源列表（仅在非eventOnly模式下）
  useEffect(() => {
    if (!eventOnly) {
      const fetchDatasources = async () => {
        try {
          const dsList = await getDatasourceList(projectId);
          setDatasources(dsList);
        } catch (error) {
          console.error('获取数据源列表失败:', error);
        }
      };
      fetchDatasources();
    } else if (datasource) {
      // 在eventOnly模式下，如果有传入的datasource，设置为选中的数据源
      setSelectedDatasource(datasource);
    }
  }, [eventOnly, datasource, projectId]);

  // 获取流程列表
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const flowList = await getFlowList(projectId, { size: 1000 });
        setFlows(flowList.list);
      } catch (error) {
        console.error('获取流程列表失败:', error);
      }
    };
    fetchFlows();
  }, [projectId]);

  // 获取模型列表
  useEffect(() => {
    if (eventOnly && model) {
      // 在eventOnly模式下，如果有传入的model，直接设置
      setModels([model]);
      return;
    }

    if (!selectedDatasource) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      try {
        const modelList = await getModelList(projectId, selectedDatasource);
        console.log('获取到的模型列表:', modelList);
        // 过滤出type='entity'的模型
        const entityModels = modelList.filter(model => model.type === 'entity');
        console.log('过滤后的实体模型:', entityModels);
        setModels(entityModels);
      } catch (error) {
        console.error('获取模型列表失败:', error);
        setModels([]);
      }
    };
    fetchModels();
  }, [selectedDatasource, eventOnly, model, projectId]);

  // 初始化表单值
  useEffect(() => {
    if (trigger && (mode === 'edit' || mode === 'view')) {
      // 处理时间字段格式转换
      const formValues = { ...trigger };
      if (trigger.config) {
        formValues.config = { ...trigger.config };

        // 转换时间字符串为 dayjs 对象
        if (trigger.config.startTime && typeof trigger.config.startTime === 'string') {
          formValues.config.startTime = dayjs(trigger.config.startTime, 'HH:mm:ss');
        }
        if (trigger.config.endTime && typeof trigger.config.endTime === 'string') {
          formValues.config.endTime = dayjs(trigger.config.endTime, 'HH:mm:ss');
        }
      }

      form.setFieldsValue(formValues);

      // 设置触发形式类型
      if (trigger.type === 'SCHEDULED') {
        const triggerFormType = trigger.config?.type || 'interval';
        setTriggerFormType(triggerFormType);
        // 确保表单中的 triggerForm 字段也被设置
        form.setFieldValue('triggerForm', triggerFormType);
      }

      // 设置选中的数据源
      if (trigger.type === 'EVENT' && 'datasourceName' in trigger.config) {
        setSelectedDatasource(trigger.config.datasourceName);
      }
    } else if (mode === 'create') {
      form.resetFields();
      setTriggerFormType(eventOnly ? 'event' : 'interval');
      setSelectedDatasource(eventOnly && datasource ? datasource : '');

      // 在eventOnly模式下预设数据源和模型
      if (eventOnly && datasource && model) {
        form.setFieldsValue({
          type: 'EVENT',
          'config.datasourceName': datasource,
          'config.modelName': model.name,
          'config.type': 'event'
        });
      }
    }
  }, [trigger, mode, form, eventOnly, datasource, model]);

  const handleSubmit = async (values: any) => {
    // 根据触发器类型设置 config 中的 type 属性
    if (values.type === 'SCHEDULED' && values.triggerForm) {
      values.config = {
        ...values.config,
        type: values.triggerForm
      };

      // 转换时间对象为字符串格式
      if (values.config.startTime && dayjs.isDayjs(values.config.startTime)) {
        values.config.startTime = values.config.startTime.format('HH:mm:ss');
      }
      if (values.config.endTime && dayjs.isDayjs(values.config.endTime)) {
        values.config.endTime = values.config.endTime.format('HH:mm:ss');
      }
    } else if (values.type === 'EVENT') {
      values.config = {
        ...values.config,
        type: 'event'
      };
    }

    if (onSubmit) {
      onSubmit(values);
    }
  };

  const handleDatasourceChange = (value: string) => {
    setSelectedDatasource(value);
    // 清空模型选择
    form.setFieldValue(['config', 'modelName'], undefined);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label={t('name')}
        rules={[{ required: true, message: t('input_valid_msg', { name: t('name') }) }]}
      >
        <Input
          placeholder={t('trigger.enter_name')}
          disabled={mode === 'view'}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={t('description')}
      >
        <Input.TextArea
          placeholder={t('trigger.enter_description')}
          rows={3}
          disabled={mode === 'view'}
        />
      </Form.Item>

      <Form.Item
        name="type"
        label={t('type')}
        rules={[{ required: true, message: t('trigger.select_type') }]}
        initialValue={eventOnly ? "EVENT" : undefined}
      >
        {eventOnly ? (
          <Input
            value={t('trigger.type_event')}
            disabled={true}
          />
        ) : (
          <Select
            placeholder={t('trigger.select_type')}
            disabled={mode === 'view'}
          >
            <Option value="SCHEDULED">{t('trigger.type_scheduled')}</Option>
            <Option value="EVENT">{t('trigger.type_event')}</Option>
          </Select>
        )}
      </Form.Item>

      {/* 当选择定时触发时，显示触发形式配置 */}
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
        {({ getFieldValue }) => {
          const triggerType = getFieldValue('type');
          if (triggerType === 'SCHEDULED') {
            return (
              <>
                <Form.Item
                  name={['config', 'type']}
                  label={t('trigger.form')}
                  rules={[{ required: true, message: t('trigger.select_form') }]}
                >
                  <Select
                    placeholder={t('trigger.select_form')}
                    disabled={mode === 'view'}
                    onChange={setTriggerFormType}
                  >
                    <Option value="interval">{t('trigger.form_interval')}</Option>
                    <Option value="cron">{t('trigger.form_cron')}</Option>
                  </Select>
                </Form.Item>

                {/* 触发形式配置 */}
                <Form.Item noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.config?.type !== currentValues.config?.type}>
                  {({ getFieldValue }) => {
                    const formType = getFieldValue(['config', 'type']) || triggerFormType;
                    return renderTriggerFormConfig(formType, mode, t, eventOnly, datasource, model);
                  }}
                </Form.Item>
              </>
            );
          } else if (triggerType === 'EVENT') {
            return renderEventTriggerConfig(mode, t, datasources, models, selectedDatasource, handleDatasourceChange, eventOnly, datasource, model);
          }
          return null;
        }}
      </Form.Item>
      <Divider titlePlacement="left">{t('trigger.job')}</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="jobType"
            label={t('trigger.job_type')}
            rules={[{ required: true, message: t('trigger.select_job_type') }]}
            initialValue="FLOW"
          >
            <Select
              placeholder={t('trigger.select_job_type')}
              disabled={mode === 'view'}
            >
              <Option value="FLOW">{t('flow')}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            name="jobId"
            label={t('trigger.job_name')}
            rules={[{ required: true, message: t('trigger.select_job_name') }]}
          >
            <Select
              placeholder={t('trigger.select_job_name')}
              disabled={mode === 'view'}
            >
              {flows.map(flow => (
                <Option key={flow.flowModuleId} value={flow.flowModuleId}>
                  {flow.flowName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

// 渲染触发形式配置
const renderTriggerFormConfig = (formType: TriggerFormType, mode: string, t: any, _eventOnly?: boolean, datasource?: string, model?: EntitySchema) => {
  if (!formType) return null;

  switch (formType) {
    case 'interval':
      return (
        <>
          <Divider titlePlacement="left">{t('trigger.interval_trigger')}</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['config', 'interval']}
                label={t('trigger.interval_value')}
                rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.interval_value') }) }]}
              >
                <InputNumber
                  min={1}
                  placeholder={t('trigger.interval_value')}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['config', 'intervalUnit']}
                label={t('trigger.interval_unit')}
                rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.interval_unit') }) }]}
              >
                <Select
                  placeholder={t('trigger.interval_unit')}
                  disabled={mode === 'view'}
                >
                  {INTERVAL_UNITS.map(unit => (
                    <Option key={unit.value} value={unit.value}>
                      {t(unit.label)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['config', 'repeatCount']}
                label={t('trigger.repeat_count')}
                tooltip={t('trigger.repeat_forever')}
              >
                <InputNumber
                  min={1}
                  placeholder={t('trigger.repeat_count')}
                  disabled={mode === 'view'}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      );

    case 'event':
      return (
        <>
          <Divider titlePlacement="left">{t('trigger.event_config')}</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['config', 'datasourceName']}
                label={t('datasource')}
                initialValue={datasource}
              >
                <Input
                  disabled={true}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['config', 'modelName']}
                label={t('model')}
                initialValue={model?.name}
              >
                <Input
                  disabled={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['config', 'mutationTypes']}
                label={t('trigger.mutation_types')}
                rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.mutation_types') }) }]}
              >
                <Checkbox.Group disabled={mode === 'view'}>
                  <Row>
                    {MUTATION_TYPES.map(mutation => (
                      <Col key={mutation.value} span={8}>
                        <Checkbox value={mutation.value}>{t(mutation.label)}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['config', 'triggerTiming']}
                label={t('trigger.timing')}
                rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.timing') }) }]}
                initialValue="after"
              >
                <Radio.Group disabled={mode === 'view'}>
                  {TRIGGER_TIMINGS.map(timing => (
                    <Radio key={timing.value} value={timing.value}>
                      {t(timing.label)}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </>
      );

    case 'cron':
      return (
        <>
          <Divider titlePlacement="left">{t('trigger.cron_trigger')}</Divider>
          <Form.Item
            name={['config', 'cronExpression']}
            label={t('trigger.cron_expression')}
            rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.cron_expression') }) }]}
            tooltip={t('trigger.cron_expression_help')}
          >
            <Input
              placeholder={t('trigger.cron_expression_placeholder')}
              disabled={mode === 'view'}
            />
          </Form.Item>
        </>
      );



    default:
      return null;
  }
};

// 渲染事件触发配置
const renderEventTriggerConfig = (
  mode: string,
  t: any,
  datasources: DatasourceSchema[],
  models: (EntitySchema | EnumSchema | NativeQuerySchema)[],
  selectedDatasource: string,
  handleDatasourceChange: (value: string) => void,
  eventOnly?: boolean,
  datasource?: string,
  model?: EntitySchema
) => {
  return (
    <>
      <Divider titlePlacement="left">{t('trigger.event_config')}</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['config', 'datasourceName']}
            label={t('datasource')}
            rules={[{ required: true, message: t('input_valid_msg', { name: t('datasource') }) }]}
            initialValue={eventOnly ? datasource : undefined}
          >
            {eventOnly ? (
              <Input
                value={datasource}
                disabled={true}
              />
            ) : (
              <Select
                placeholder={t('select_datasource')}
                disabled={mode === 'view'}
                onChange={handleDatasourceChange}
              >
                {datasources.map(ds => (
                  <Option key={ds.name} value={ds.name}>
                    {ds.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['config', 'modelName']}
            label={t('model')}
            rules={[{ required: true, message: t('input_valid_msg', { name: t('model') }) }]}
            initialValue={eventOnly ? model?.name : undefined}
          >
            {eventOnly ? (
              <Input
                value={model?.name}
                disabled={true}
              />
            ) : (
              <Select
                placeholder={t('select_model')}
                disabled={mode === 'view' || !selectedDatasource}
              >
                {models.map(model => (
                  <Option key={model.name} value={model.name}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['config', 'mutationTypes']}
            label={t('trigger.mutation_types')}
            rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.mutation_types') }) }]}
          >
            <Checkbox.Group disabled={mode === 'view'}>
              <Row>
                {MUTATION_TYPES.map(mutation => (
                  <Col key={mutation.value} span={8}>
                    <Checkbox value={mutation.value}>{t(mutation.label)}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['config', 'triggerTiming']}
            label={t('trigger.timing')}
            rules={[{ required: true, message: t('input_valid_msg', { name: t('trigger.timing') }) }]}
            initialValue="after"
          >
            <Radio.Group disabled={mode === 'view'}>
              {TRIGGER_TIMINGS.map(timing => (
                <Radio key={timing.value} value={timing.value}>
                  {t(timing.label)}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default TriggerForm;
