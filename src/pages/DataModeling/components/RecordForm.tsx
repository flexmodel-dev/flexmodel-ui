import React, {useCallback, useEffect, useMemo} from 'react';
import {DatePicker, Form, Input, Switch} from 'antd';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import type {Field, MRecord} from '@/types/data-modeling.d.ts';

export interface RecordFormProps {
  /** 模型信息 */
  model: any;
  /** 表单模式：create | edit | view */
  mode: 'create' | 'edit' | 'view';
  /** 编辑时的记录数据 */
  record?: MRecord;
  /** 外部Form实例 */
  form?: any;
}

const RecordForm: React.FC<RecordFormProps> = ({
  model,
  mode,
  record,
  form: externalForm
}) => {
  const { t } = useTranslation();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  const fieldMap = useMemo(() => {
    return model?.fields?.reduce((acc: Record<string, Field>, field: Field) => {
      acc[field.name] = field;
      return acc;
    }, {} as Record<string, Field>) || {};
  }, [model?.fields]);

  // 格式化表单字段值
  const formatFormFieldsValue = useCallback((changedValues: Record<string, any>): Record<string, any> => {
    const formattedValues: Record<string, any> = {};
    for (const [key, value] of Object.entries(changedValues)) {
      const field = fieldMap[key];
      if (!field) continue;

      switch (field.type) {
        case "Date":
          formattedValues[key] = value ? dayjs(value as string, 'YYYY-MM-DD') : undefined;
          break;
        case "DateTime":
          formattedValues[key] = value ? dayjs(value as string) : undefined;
          break;
        case "JSON":
          formattedValues[key] = typeof value === 'string' ? value : JSON.stringify(value);
          break;
        default:
          formattedValues[key] = value;
      }
    }
    return formattedValues;
  }, [fieldMap]);

  // 初始化表单值
  useEffect(() => {
    if (record && (mode === 'edit' || mode === 'view')) {
      const formattedValues = formatFormFieldsValue(record);
      form.setFieldsValue(formattedValues);
    } else if (mode === 'create') {
      form.resetFields();
    }
  }, [record, mode, form, formatFormFieldsValue]);


  // 渲染字段输入组件
  const renderFieldInput = useCallback((field: Field) => {
    const inputProps = {
      placeholder: field.comment || field.name,
      disabled: mode === 'view' || (field.identity === true && mode === 'edit')
    };

    switch (field.type) {
      case 'String':
        if (field.text) {
          return <Input.TextArea {...inputProps} size="small" rows={3}/>;
        }
        return <Input {...inputProps} size="small" />;
      case 'Text':
      case 'JSON':
        return <Input.TextArea {...inputProps} size="small" rows={3} />;
      case 'Decimal':
      case 'Int':
      case 'Long':
        return <Input type="number" {...inputProps} size="small" />;
      case 'Boolean':
        return <Switch disabled={mode === 'view'} />;
      case 'Date':
        return <DatePicker
          picker="date"
          style={{ width: '100%' }}
          {...inputProps}
          size="small"
        />;
      case 'DateTime':
        return <DatePicker
          showTime
          style={{ width: '100%' }}
          {...inputProps}
          size="small"
        />;
      default:
        return <Input {...inputProps} size="small" />;
    }
  }, [mode]);

  // 获取字段验证规则
  const getFieldRules = (field: Field) => {
    const rules = [];

    if (!field.nullable && mode !== 'view') {
      rules.push({
        required: true,
        message: t('input_valid_msg', { name: field.name })
      });
    }

    return rules;
  };


  if (!model) {
    return null;
  }

  return (
    <Form form={form} layout="vertical">
      {model.fields
        .filter((field: Field) => field.type !== 'Relation')
        .map((field: Field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.name}
            rules={getFieldRules(field)}
            tooltip={field.comment}
          >
            {renderFieldInput(field)}
          </Form.Item>
        ))}
    </Form>
  );
};

export default RecordForm;
