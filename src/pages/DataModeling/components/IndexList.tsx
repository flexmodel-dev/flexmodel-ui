import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Input, message, Modal, Popconfirm, Space, Table, Tag} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {createIndex, dropIndex, modifyIndex} from '@/services/model.ts';
import IndexForm from "./IndexForm";
import {Entity, Index} from "@/types/data-modeling";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

interface IndexListProps {
  datasource: string;
  model: Entity;
}

const IndexList: React.FC<IndexListProps> = ({datasource, model}) => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [indexList, setIndexList] = useState<Index[]>([]);
  const [filteredIndexList, setFilteredIndexList] = useState<Index[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [changeDialogVisible, setChangeDialogVisible] = useState<boolean>(false);
  const [selectedIndexKey, setSelectedIndexKey] = useState<number>(-1);
  const [currentVal, setCurrentVal] = useState<Index>({name: '', fields: [], unique: false});
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const indexFormRef = useRef<any>(null);

  const fetchIndexes = useCallback(async () => {
    // Replace this with actual fetch call
    // const res = await getIndexes(datasource, model?.name);
    setIndexList(model?.indexes || []);
  }, [model?.indexes]);

  // 搜索过滤逻辑
  const filterIndexes = useCallback((indexes: Index[], keyword: string) => {
    if (!keyword.trim()) {
      return indexes;
    }
    return indexes.filter(index => 
      index.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  // 当索引列表或搜索关键词变化时，更新过滤后的列表
  useEffect(() => {
    const filtered = filterIndexes(indexList, searchKeyword);
    setFilteredIndexList(filtered);
  }, [indexList, searchKeyword, filterIndexes]);

  useEffect(() => {
    fetchIndexes();
  }, [fetchIndexes]);

  const handleNewIndex = () => {
    setFormMode('create');
    setChangeDialogVisible(true);
    setSelectedIndexKey(-1);
    setCurrentVal({name: '', fields: [], unique: false});
  };

  const handleEdit = (index: number) => {
    setFormMode('edit');
    setSelectedIndexKey(index);
    setCurrentVal(indexList[index]);
    setChangeDialogVisible(true);
  };

  const addOrEditIndex = async (values: Index) => {
    try {
      const indexSchema = {
        name: values.name,
        fields: values.fields.map((f: any) => ({
          fieldName: f.fieldName,
          direction: f.direction,
          name: f.fieldName,
          type: '', // 需根据实际情况填写
          concreteType: '',
          unique: false,
          nullable: false,
          comment: '',
        })),
        unique: values.unique,
        modelName: model?.name,
      };
      if (selectedIndexKey === -1) {
        await createIndex(projectId, datasource, model?.name as string, indexSchema);
        setIndexList([...indexList, values]);
      } else {
        await modifyIndex(projectId, datasource, model?.name as string, values.name, indexSchema);
        const updatedIndexes = [...indexList];
        updatedIndexes[selectedIndexKey] = values;
        setIndexList(updatedIndexes);
      }
      setChangeDialogVisible(false);
      message.success(t('form_save_success'));
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleModalOk = () => {
    if (indexFormRef.current) {
      indexFormRef.current.submit();
    }
  };

  const handleModalCancel = () => {
    setChangeDialogVisible(false);
    if (indexFormRef.current) {
      indexFormRef.current.reset();
    }
  };

  const delIndex = async (key: number) => {
    try {
      const index = indexList[key];
      await dropIndex(projectId, datasource, model?.name as string, index.name);
      setIndexList(indexList.filter((_, i) => i !== key));
      message.success(t('index_delete_success'));
    } catch (error) {
      console.error(error);
      message.error(t('index_delete_failed'));
    }
  };

  const columns = [
    {title: t('name'), dataIndex: 'name', key: 'name'},
    {
      title: t('fields'),
      dataIndex: 'fields',
      key: 'fields',
      render: (fields: { fieldName: string; direction: string }[]) => (
        <Space>
          {fields.map((field, index) => (
            <Tag key={index} color="default">
              {field.fieldName} {field.direction}
            </Tag>
          ))}
        </Space>
      ),
    },
    {title: t('unique'), dataIndex: 'unique', key: 'unique', render: (unique: boolean) => (unique ? t('yes') : t('no'))},
    {
      title: t('operations'),
      key: 'operations',
      render: (_: any, _record: Index, index: number) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined/>}
            onClick={() => handleEdit(index)}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('table_selection_delete_text')}
            onConfirm={() => delIndex(index)}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined/>}
            >
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Input
          size="small"
          placeholder={t("search_indexes")}
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined/>}
          onClick={handleNewIndex}
          size="small"
        >
          {t('new_index')}
        </Button>
      </div>
      <Table
        rowKey="name"
        scroll={{ y: 450 }}
        dataSource={filteredIndexList}
        columns={columns}
        pagination={false}
      />
      <Modal
        title={t("index_form_title")}
        open={changeDialogVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        width={600}
      >
        <IndexForm
          ref={indexFormRef}
          mode={formMode}
          datasource={datasource}
          model={model}
          currentValue={currentVal}
          onConfirm={addOrEditIndex}
          onCancel={handleModalCancel}
        />
      </Modal>
    </>
  );
};

export default IndexList;

