import React, {useCallback, useEffect, useState} from 'react';
import {Button, Empty, Form, Input, message, Modal, Popconfirm, Space, Table, Tooltip} from 'antd';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {DeleteOutlined, DownOutlined, EditOutlined, PlusOutlined, SearchOutlined, UpOutlined} from "@ant-design/icons";
import {createRecord, deleteRecord, getRecordList, updateRecord} from "@/services/record.ts";
import {useTranslation} from "react-i18next";
import type {Field, MRecord, RecordListProps} from '@/types/data-modeling.d.ts';
import RecordForm from './RecordForm';
import dayjs from 'dayjs';
import {useProject} from "@/store/appStore";

const { TextArea } = Input;

const RecordList: React.FC<RecordListProps> = ({ datasource, model }) => {
  const { t } = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  const [dialogFormVisible, setDialogFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MRecord | undefined>();
  const [records, setRecords] = useState<{ list: MRecord[]; total: number }>({ list: [], total: 0 });
  const [query, setQuery] = useState({ page: 1, size: 10, filter: '', sort: [] as Array<{ field: string; order: 'ASC' | 'DESC' }> });
  const [searchValue, setSearchValue] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [form] = Form.useForm();

  const idField = model?.fields?.find((f: Field) => f.identity === true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const apiQuery = {
        ...query,
        sort: query.sort.length > 0 ? JSON.stringify(query.sort) : undefined
      };
      const data = await getRecordList(projectId, datasource, model.name, apiQuery);
      setRecords(data as { list: MRecord[]; total: number });
    } catch (error) {
      console.error('Failed to fetch records:', error);
      message.error('Failed to fetch records');
      setRecords({ list: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [projectId, datasource, model.name, query]);

  useEffect(() => {
    if (model) fetchRecords();
  }, [query, model, fetchRecords]);

  const handleEdit = (record: MRecord) => {
    setCurrentRecord(record);
    setEditMode(true);
    setDialogFormVisible(true);
  };

  const handleDelete = async (record: MRecord) => {
    if (!idField) {
      message.warning(t('record_delete_no_id_warning'));
      return;
    }
    try {
      await deleteRecord(projectId, datasource, model.name, record[idField.name]);
      message.success(t('record_delete_success') || 'Record deleted successfully');
      await fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      message.error(t('record_delete_failed') || 'Failed to delete record');
    }
  };

  const handleCancel = () => {
    setDialogFormVisible(false);
    setCurrentRecord(undefined);
    form.resetFields();
  };

  // 格式化表单数据
  const formatFormData = (values: Record<string, any>): MRecord => {
    const formattedValues: MRecord = {};
    for (const [key, value] of Object.entries(values)) {
      const field = model?.fields?.find((f: Field) => f.name === key);
      if (!field) continue;

      switch (field.type) {
        case "Date":
          formattedValues[key] = value ? dayjs(value).format('YYYY-MM-DD') : null;
          break;
        case "DateTime":
          formattedValues[key] = value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null;
          break;
        case "JSON":
          try {
            formattedValues[key] = typeof value === 'string' ? JSON.parse(value) : value;
          } catch {
            formattedValues[key] = value;
          }
          break;
        default:
          formattedValues[key] = value;
      }
    }
    return formattedValues;
  };

  const columns: ColumnsType<MRecord> = model?.fields
    .filter((field: Field) => field.type !== 'Relation')
    .map((field: Field) => ({
      title: field.name,
      dataIndex: field.name,
      key: field.name,
      width: 150,
      minWidth: 120,
      sorter: true,
      sortOrder: query.sort.find(s => s.field === field.name)?.order === 'ASC' ? 'ascend' :
        query.sort.find(s => s.field === field.name)?.order === 'DESC' ? 'descend' : null,
      render: (text: string) => {
        // 如果值为 null 或 undefined，显示 "-"
        if (text === null || text === undefined) {
          return '-';
        }

        const fmtText = (typeof text === 'object' ? JSON.stringify(text) : text.toString());

        // 根据字段类型设置最大长度
        let maxLength = 50; // 默认最大长度
        if (field.type === 'String') {
          maxLength = 30;
        } else if (field.type === 'JSON') {
          maxLength = 40;
        } else if (field.type === 'Text') {
          maxLength = 50;
        } else if (field.type === 'Date' || field.type === 'DateTime') {
          maxLength = 20;
        } else if (field.type === 'Number' || field.type === 'Integer' || field.type === 'Float') {
          maxLength = 15;
        } else if (field.type === 'Boolean') {
          maxLength = 10;
        }

        const displayText = fmtText && fmtText.length > maxLength
          ? fmtText.substring(0, maxLength) + '...'
          : fmtText;

        return (field.type === 'String' || field.type === 'JSON' || field.type === 'Text') ? (
          <Tooltip title={fmtText}>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
              {displayText}
            </span>
          </Tooltip>
        ) : displayText;
      },
    })) || [];

  columns.push({
    title: t('operations'),
    key: 'operations',
    fixed: 'right',
    width: 180,
    render: (_, record) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>{t('edit')}</Button>
        <Popconfirm title={t('table_selection_delete_text')} onConfirm={() => handleDelete(record)}>
          <Button size="small" type="link" icon={<DeleteOutlined />} danger>{t('delete')}</Button>
        </Popconfirm>
      </Space>
    ),
  });


  // 事件处理函数
  const handleNewRecord = () => {
    setCurrentRecord(undefined);
    setEditMode(false);
    setDialogFormVisible(true);
  };


  const handleTableChange = (pagination: TablePaginationConfig, _filters: any, sorter: any) => {
    let newSort: Array<{ field: string; order: 'ASC' | 'DESC' }> = [];

    if (sorter && sorter.field) {
      const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      newSort = [{ field: sorter.field, order }];
    }

    setQuery({
      ...query,
      page: pagination.current || 1,
      size: pagination.pageSize || 10,
      sort: newSort
    });
  };

  const handleSearch = () => {
    setQuery({ ...query, page: 1, filter: searchValue }); // 重置到第一页，更新 filter
  };

  // 渲染主要内容
  const renderContent = () => {
    if (!model) {
      return <Empty />;
    }

    return (
      <>
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>


          {searchExpanded && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <TextArea
                value={searchValue}
                rows={2}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={'e.g. { "id": { "_eq": 1, "_and": { "name": { "_eq": "zhangsan" } } } }'}
                allowClear
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                style={{ height: 'auto' }}
              >
                {t('search') || 'Search'}
              </Button>
            </div>
          )}
        </div>

        {/* 头部操作区 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button
              type="text"
              size="small"
              icon={searchExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setSearchExpanded(!searchExpanded)}
            >
              {searchExpanded ? t('collapse') || 'Collapse' : t('expand') || 'Expand'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewRecord}
              size="small"
            >
              {t('new_record')}
            </Button>
          </Space>
        </div>

        <Table
            sticky
            loading={loading}
            scroll={{
              y: 'calc(100vh - 260px)',
              x: 'max-content'
            }}
            columns={columns}
            dataSource={records.list}
            rowKey={idField?.name}
            onChange={handleTableChange}
            pagination={{
              current: query.page,
              pageSize: query.size,
              total: records.total,
              showTotal: (total, range) =>
                t("pagination_total_text", {
                  start: range[0],
                  end: range[1],
                  total: total,
                }),
              size: "small"
            }}
          />
      </>
    );
  };

  // 处理表单提交
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = formatFormData(values);

      if (editMode) {
        if (!idField || !currentRecord || !currentRecord[idField.name]) {
          message.warning(t('record_edit_no_id_warning'));
          return;
        }
        await updateRecord(projectId, datasource, model.name, currentRecord[idField.name], formattedValues);
      } else {
        await createRecord(projectId, datasource, model.name, formattedValues);
      }

      setDialogFormVisible(false);
      setCurrentRecord(undefined);
      form.resetFields();
      await fetchRecords();
      message.success(editMode ? t('record_updated_success') : t('record_created_success'));
    } catch (error) {
      console.error('Form submission failed:', error);
      message.error(editMode ?
        (t('record_update_failed') || 'Failed to update record') :
        (t('record_create_failed') || 'Failed to create record')
      );
    }
  };

  // 渲染模态框
  const renderModal = () => {
    if (!model) return null;

    return (
      <Modal
        title={t('record_form_title', {
          mode: editMode ? t('record_form_edit') : t('record_form_create'),
          modelName: model.name
        })}
        open={dialogFormVisible}
        onCancel={handleCancel}
        onOk={handleFormSubmit}
        width={600}
      >
        <RecordForm
          model={model}
          mode={editMode ? 'edit' : 'create'}
          record={currentRecord}
          form={form}
        />
      </Modal>
    );
  };

  return (
    <>
      {renderContent()}
      {renderModal()}
    </>
  );
};

export default RecordList;
