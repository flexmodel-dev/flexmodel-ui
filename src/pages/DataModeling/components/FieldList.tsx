import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, Input, message, Modal, Popconfirm, Space, Table, Tooltip,} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  KeyOutlined,
  LinkOutlined,
  NumberOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined
} from "@ant-design/icons";
import {createField, dropField, modifyField} from "@/services/model.ts";
import FieldForm, {FieldInitialValues} from "./FieldForm.tsx";
import {Entity, Field, TypedFieldSchema} from "@/types/data-modeling";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

interface FieldListProps {
  datasource: string;
  model: Entity;
}

const FieldList: React.FC<FieldListProps> = ({ datasource, model }) => {
  const { t } = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [fieldList, setFieldList] = useState<Field[]>([]);
  const [filteredFieldList, setFilteredFieldList] = useState<Field[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [changeDialogVisible, setChangeDialogVisible] =
    useState<boolean>(false);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>(-1);
  const [currentVal, setCurrentVal] = useState<Field>(
    FieldInitialValues["STRING"]
  );
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const fieldFormRef = useRef<any>(null);

  const fetchFields = useCallback(async () => {
    // Replace this with actual fetch call
    // const res = await getFields(datasource, model?.name);
    setFieldList(model?.fields);
  }, [model?.fields]);

  // 搜索过滤逻辑
  const filterFields = useCallback((fields: Field[], keyword: string) => {
    if (!keyword.trim()) {
      return fields;
    }
    return fields.filter(field => 
      field.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  // 当字段列表或搜索关键词变化时，更新过滤后的列表
  useEffect(() => {
    const filtered = filterFields(fieldList, searchKeyword);
    setFilteredFieldList(filtered);
  }, [fieldList, searchKeyword, filterFields]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleNewField = () => {
    setFormMode('create');
    setChangeDialogVisible(true);
    setSelectedFieldIndex(-1);
    setCurrentVal({
      ...FieldInitialValues["STRING"],
      tmpType: "String"
    });
  };

  const handleEdit = (index: number) => {
    const field = fieldList[index];
    setFormMode('edit');
    setSelectedFieldIndex(index);

    // 根据字段类型正确设置tmpType
    let tmpTypeValue = field.tmpType;
    if (!tmpTypeValue) {
      if (field.type === 'Relation' && field.from) {
        tmpTypeValue = `Relation:${field.from}`;
      } else if (field.type === 'Enum' && field.from) {
        tmpTypeValue = `Enum:${field.from}`;
      } else {
        tmpTypeValue = field.type;
      }
    }

    setCurrentVal({
      ...field,
      tmpType: tmpTypeValue
    });
    setChangeDialogVisible(true);
  };

  const addOrEditField = async (values: Field) => {
    try {
      const typedField: TypedFieldSchema = {
        name: values.name,
        type: values.type,
        unique: values.unique ?? false,
        nullable: values.nullable ?? false,
        comment: values.comment,
        defaultValue: values.defaultValue,
        modelName: model?.name,
        identity: values.identity ?? false,
      };
      if (selectedFieldIndex === -1) {
        const res = await createField(projectId, datasource, model?.name, typedField);
        setFieldList([...fieldList, res as unknown as Field]);
      } else {
        await modifyField(projectId, datasource, model?.name, values.name, typedField);
        const updatedFields = [...fieldList];
        updatedFields[selectedFieldIndex] = values;
        setFieldList(updatedFields);
      }
      setChangeDialogVisible(false);
      message.success(t("form_save_success"));
    } catch (error) {
      console.log(error);
      message.error(t("form_save_failed"));
    }
  };

  const handleModalOk = () => {
    if (fieldFormRef.current) {
      fieldFormRef.current.submit();
    }
  };

  const handleModalCancel = () => {
    setChangeDialogVisible(false);
    if (fieldFormRef.current) {
      fieldFormRef.current.reset();
    }
  };

  const delField = async (index: number) => {
    try {
      const field = fieldList[index];
      await dropField(projectId, datasource, model?.name, field.name);
      setFieldList(fieldList.filter((_, i) => i !== index));
      message.success(t("field_delete_success"));
    } catch (error) {
      console.log(error);
      message.error(t("field_delete_failed"));
    }
  };

  // 根据字段类型获取对应的图标
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'String':
        return <FontSizeOutlined style={{ color: '#1890ff', marginRight: 4 }} />;
      case 'Int':
      case 'Long':
      case 'Float':
      case 'Decimal':
        return <NumberOutlined style={{ color: '#52c41a', marginRight: 4 }} />;
      case 'Boolean':
        return <CheckCircleOutlined style={{ color: '#722ed1', marginRight: 4 }} />;
      case 'Date':
        return <CalendarOutlined style={{ color: '#13c2c2', marginRight: 4 }} />;
      case 'Time':
        return <ClockCircleOutlined style={{ color: '#eb2f96', marginRight: 4 }} />;
      case 'DateTime':
        return <CalendarOutlined style={{ color: '#fa8c16', marginRight: 4 }} />;
      case 'JSON':
        return <FileTextOutlined style={{ color: '#f5222d', marginRight: 4 }} />;
      case 'Relation':
        return <LinkOutlined style={{ color: '#2f54eb', marginRight: 4 }} />;
      case 'EnumRef':
        return <TagsOutlined style={{ color: '#fa541c', marginRight: 4 }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Field) => (
        <span>
          {record.identity ? (
            <KeyOutlined
              style={{ color: '#faad14', marginRight: 4 }}
              title={t("identity_field")}
            />
          ) : (
            getFieldTypeIcon(record.type)
          )}
          {name}
        </span>
      )
    },
    {
      title: t("type"),
      dataIndex: "type",
      key: "type",
      render: (type: string, f: Field) => {
        if (type === "Relation") {
          return (
            <Tooltip
              title={
                <span>
                  {t("local_field")}: {f?.localField + ""}
                  <br />
                  {t("foreign_field")}: {f?.foreignField + ""}
                  <br />
                  {t("cascade_delete")}: {f?.cascadeDelete + ""}
                </span>
              }
            >
              {f.concreteType}
            </Tooltip>
          );
        }
        if (type === "EnumRef") {
          return (
            <Tooltip title={<span>{t("enums")}</span>}>
              {f.concreteType}
            </Tooltip>
          );
        }
        return type;
      },
    },
    {
      title: t("default_value"),
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (value: { type: "generated" | "fixed"; value: string | number | boolean | null; name: string | null; } | undefined) => {
        if (!value) return '-';
        if (value.type === 'fixed') {
          return value.value !== null ? value.value : 'null';
        }
        if (value.type === 'generated') {
          return value.name ? `Generated: ${value.name}` : 'Generated';
        }
        return '-';
      },
    },
    {
      title: t("unique"),
      dataIndex: "unique",
      key: "unique",
      render: (value: boolean) => (value ? t("yes") : t("no")),
    },
    {
      title: t("nullable"),
      dataIndex: "nullable",
      key: "nullable",
      render: (value: boolean) => (value ? t("yes") : t("no")),
    },
    { title: t("comment"), dataIndex: "comment", key: "comment" },
    {
      title: t("operations"),
      key: "operations",
      render: (_: any, _record: Field, index: number) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(index)}
            size="small"
          >
            {t("edit")}
          </Button>
          <Popconfirm
            title={t("table_selection_delete_text")}
            onConfirm={() => delField(index)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              {t("delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
      >
        <Input
          size="small"
          placeholder={t("search_fields")}
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewField}
          size="small"
        >
          {t("new_field")}
        </Button>
      </div>
      <Table
        rowKey={(record, index) => `${record.name}-${index}`}
        scroll={{ y: 450 }}
        dataSource={filteredFieldList}
        columns={columns}
        pagination={false}
      />
      <Modal
        title={t("field_form_title")}
        open={changeDialogVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        width={600}
      >
        <FieldForm
          ref={fieldFormRef}
          mode={formMode}
          datasource={datasource}
          model={model}
          currentValue={currentVal}
          onConfirm={addOrEditField}
          onCancel={handleModalCancel}
        />
      </Modal>
    </>
  );
};

export default FieldList;
