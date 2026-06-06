import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Divider, Form, Input, InputNumber, Radio, Row, Select} from 'antd';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {INTERVAL_UNITS, MUTATION_TYPES, TRIGGER_TIMINGS, TriggerFormType} from '@/types/trigger';
import {TriggerDTO} from '@/services/trigger';
import {getModelList} from '@/services/model';
import {FlowModule, getFlowList} from '@/services/flow';
import {EntitySchema, EnumSchema, NativeQuerySchema} from '@/types/data-modeling';
import {useProject} from '@/store/appStore';

const { Option } = Select;

export interface TriggerFormProps {
  mode: 'create' | 'edit' | 'view';
  trigger?: TriggerDTO;
  form?: any;
  onSubmit?: (values: any) => void;
  model?: EntitySchema;
  eventOnly?: boolean;
}

const TriggerForm: React.FC<TriggerFormProps> = ({
  mode,
  trigger,
  form: externalForm,
  onSubmit,
  model,
  eventOnly = false
}) => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [triggerFormType, setTriggerFormType] = useState<TriggerFormType>(eventOnly ? 'event' : 'interval');
  const [models, setModels] = useState<(EntitySchema | EnumSchema | NativeQuerySchema)[]>([]);
  const [flows, setFlows] = useState<FlowModule[]>([]);

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

  useEffect(() => {
    if (eventOnly && model) {
      setModels([model]);
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
  }, [eventOnly, model, projectId]);

  useEffect(() => {
    if (trigger && (mode === 'edit' || mode === 'view')) {
      const formValues = { ...trigger };
      if (trigger.config) {
        formValues.config = { ...trigger.config };

        if (trigger.config.startTime && typeof trigger.config.startTime === 'string') {
          formValues.config.startTime = dayjs(trigger.config.startTime, 'HH:mm:ss');
        }
        if (trigger.config.endTime && typeof trigger.config.endTime === 'string') {
          formValues.config.endTime = dayjs(trigger.config.endTime, 'HH:mm:ss');
        }
      }

      form.setFieldsValue(formValues);

      if (trigger.type === 'SCHEDULED') {
        const triggerFormType = trigger.config?.type || 'interval';
        setTriggerFormType(triggerFormType);
        form.setFieldValue('triggerForm', triggerFormType);
      }
    } else if (mode === 'create') {
      form.resetFields();
      setTriggerFormType(eventOnly ? 'event' : 'interval');

      if (eventOnly && model) {
        form.setFieldsValue({
          type: 'EVENT',
          'config.modelName': model.name,
          'config.type': 'event'
        });
      }
    }
  }, [trigger, mode, form, eventOnly, model]);

  const handleSubmit = async (values: any) => {
    if (values.type === 'SCHEDULED' && values.triggerForm) {
      values.config = {
        ...values.config,
        type: values.triggerForm
      };

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

                <Form.Item noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.config?.type !== currentValues.config?.type}>
                  {({ getFieldValue }) => {
                    const formType = getFieldValue(['config', 'type']) || triggerFormType;
                    return renderTriggerFormConfig(formType, mode, t, eventOnly, model);
                  }}
                </Form.Item>
              </>
            );
          } else if (triggerType === 'EVENT') {
            return renderEventTriggerConfig(mode, t, models, eventOnly, model);
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

const renderTriggerFormConfig = (formType: TriggerFormType, mode: string, t: any, _eventOnly?: boolean, model?: EntitySchema) => {
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

const renderEventTriggerConfig = (
  mode: string,
  t: any,
  models: (EntitySchema | EnumSchema | NativeQuerySchema)[],
  eventOnly?: boolean,
  model?: EntitySchema
) => {
  return (
    <>
      <Divider titlePlacement="left">{t('trigger.event_config')}</Divider>
      <Row gutter={16}>
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
                disabled={mode === 'view'}
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
