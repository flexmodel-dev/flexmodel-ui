import React, {useEffect, useState} from 'react';
import {Button, Form, message, Modal, Popconfirm, Space, Table, Tag, Tooltip} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import PageContainer from '@/components/common/PageContainer';
import TriggerForm from './TriggerForm';
import {TriggerDTO} from '@/services/trigger';
import {EntitySchema} from '@/types/data-modeling';
import {useProject} from "@/store/appStore";

interface TriggerListProps {
  /** 数据源名称（用于事件触发模式） */
  datasource?: string;
  /** 模型信息（用于事件触发模式） */
  model?: EntitySchema;
  /** 是否只显示事件触发 */
  eventOnly?: boolean;
}

const TriggerList: React.FC<TriggerListProps> = ({datasource, model, eventOnly = false}) => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [form] = Form.useForm();
  const [triggers, setTriggers] = useState<TriggerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerDTO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadTriggers();
  }, [currentPage, pageSize, eventOnly, datasource, model]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTriggers = async () => {
    setLoading(true);
    try {
      const {getTriggerPage} = await import('@/services/trigger');
      const params: any = {
        page: currentPage,
        size: pageSize
      };

      if (eventOnly && datasource && model) {
        params.jobGroup = `${datasource}_${model.name}`;
      }

      const response = await getTriggerPage(projectId, params);
      setTriggers(response.list);
      setTotal(response.total);
    } catch {
      message.error(t('trigger.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTrigger(null);
    setModalVisible(true);
  };

  const handleEdit = (trigger: TriggerDTO) => {
    setEditingTrigger(trigger);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const {deleteTrigger} = await import('@/services/trigger');
      await deleteTrigger(projectId, id);
      message.success(t('delete_success'));
      loadTriggers();
    } catch {
      message.error(t('delete_failed'));
    }
  };

  const handleToggleStatus = async (trigger: TriggerDTO) => {
    try {
      const {patchTrigger} = await import('@/services/trigger');
      await patchTrigger(projectId, trigger.id!, {
        ...trigger,
        state: !trigger.state
      });
      message.success(t('status_updated_success'));
      loadTriggers();
    } catch {
      message.error(t('status_update_failed'));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const {createTrigger, updateTrigger} = await import('@/services/trigger');
      if (editingTrigger) {
        await updateTrigger(projectId, editingTrigger.id!, {
          ...values,
          jobId: values.jobId || editingTrigger.jobId
        });
        message.success(t('update_success'));
      } else {
        await createTrigger(projectId, {
          ...values,
          jobId: values.jobId
        });
        message.success(t('create_success'));
      }
      setModalVisible(false);
      loadTriggers();
    } catch {
      message.error(editingTrigger ? t('update_failed') : t('create_failed'));
    }
  };

  const handleExecute = async (id: string) => {
    try {
      const {executeTrigger} = await import('@/services/trigger');
      await executeTrigger(projectId, id);
      message.success(t('trigger.execute_success'));
    } catch {
      message.error(t('trigger.execute_failed'));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SCHEDULED':
        return 'blue';
      case 'EVENT':
        return 'green';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SCHEDULED':
        return t('trigger.type_scheduled');
      case 'EVENT':
        return t('trigger.type_event');
      default:
        return type;
    }
  };

  const getJobTypeText = (jobType: string) => {
    switch (jobType) {
      case 'FLOW':
        return t('flow');
      default:
        return jobType;
    }
  };

  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: t('trigger.job_type'),
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType: string) => (
        <Tag color="blue">
          {getJobTypeText(jobType)}
        </Tag>
      ),
    },
    {
      title: t('trigger.job_name'),
      dataIndex: 'jobName',
      key: 'jobName',
    },
    {
      title: t('status'),
      dataIndex: 'state',
      key: 'state',
      render: (state: boolean) => (
        <Tag color={state ? 'green' : 'red'}>
          {state ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: t('operations'),
      key: 'operations',
      render: (_: any, record: TriggerDTO) => (
        <Space>
          <Tooltip title={t('trigger.execute')}>
            <Button
              type="text"
              icon={<ThunderboltOutlined/>}
              onClick={() => handleExecute(record.id!)}
            />
          </Tooltip>
          <Tooltip title={record.state ? t('pause') : t('start')}>
            <Button
              type="text"
              icon={record.state ? <PauseCircleOutlined/> : <PlayCircleOutlined/>}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title={t('edit')}>
            <Button
              type="text"
              icon={<EditOutlined/>}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t('delete_confirm')}
            description={t('trigger.delete_confirm_desc', {name: record.name})}
            onConfirm={() => handleDelete(record.id!)}
            okText={t('confirm')}
            cancelText={t('cancel')}
          >
            <Tooltip title={t('delete')}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined/>}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 直接使用API返回的数据，不需要客户端分页
  return (
    <PageContainer
      title={t('trigger.title')
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined/>}
          onClick={handleCreate}
        >
          {t('trigger.create')}
        </Button>
      }
      loading={loading}
    >
      <Table
        columns={columns}
        dataSource={triggers}
        loading={loading}
        rowKey="id"
        scroll={{y: '60vh'}}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            t('pagination_total_text', {
              start: range[0],
              end: range[1],
              total: total
            }),
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
          onShowSizeChange: (_current: number, size: number) => {
            setCurrentPage(1);
            setPageSize(size);
          }
        }}
      />

      <Modal
        title={editingTrigger ? t('trigger.edit') : t('trigger.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <TriggerForm
          mode={editingTrigger ? 'edit' : 'create'}
          trigger={editingTrigger || undefined}
          onSubmit={handleSubmit}
          form={form}
          datasource={datasource}
          model={model}
          eventOnly={eventOnly}
        />
      </Modal>
    </PageContainer>
  );
};

export default TriggerList;
