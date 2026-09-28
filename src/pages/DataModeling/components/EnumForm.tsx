import React, {useEffect} from 'react';
import {Button, Card, Descriptions, Form, Input, Table, Typography} from 'antd';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import type {Enum} from '@/types/data-modeling';
import {buildEnumPayload, toElementRows, type ElementRow} from './enumPayload';
import {rounded, spacing} from '@/theme/designTokens';

interface EnumFormProps {
  form?: any;
  mode?: 'create' | 'edit' | 'view';
  datasource?: string;
  model?: Partial<Enum>;
  onConfirm?: (model: Enum) => void;
}


const EnumForm = ({
  form: externalForm,
  mode = 'create',
  datasource: _datasource,
  model,
  onConfirm,
  ref,
}: EnumFormProps & { ref?: React.Ref<any> }) => {
  const {t} = useTranslation();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const isView = mode === 'view';

  useEffect(() => {
    if (model) {
      form.setFieldsValue({...model, elements: toElementRows(model)});
    }
  }, [model, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (onConfirm) {
        onConfirm(buildEnumPayload(values));
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  React.useImperativeHandle(ref, () => ({
    submit: handleSave,
    reset: () => form.resetFields(),
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));

  if (isView) {
    const rows = model ? toElementRows(model) : [];

    return (
      <div style={{maxWidth: 760}}>
        <Descriptions
          bordered
          column={2}
          size="small"
          items={[
            {key: 'name', label: t('name'), children: model?.name || '-'},
            {key: 'comment', label: t('comment'), children: model?.comment || '-'},
          ]}
        />
        <Table
          size="small"
          pagination={false}
          rowKey={(row: ElementRow) => row.name || '-'}
          dataSource={rows}
          style={{marginTop: spacing.md}}
          columns={[
            {title: t('element_name'), dataIndex: 'name', width: 180},
            {
              title: t('element_code'),
              dataIndex: 'code',
              width: 120,
              render: (value: ElementRow['code']) => (value === '' || value === undefined ? '-' : String(value)),
            },
            {title: t('element_comment'), dataIndex: 'comment', render: (value: ElementRow['comment']) => value || '-'},
          ]}
        />
      </div>
    );
  }

  const elementGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(140px, 1fr) 88px minmax(180px, 1.5fr) 32px',
    gap: spacing.xs,
    alignItems: 'center',
  };

  return (
    <Form form={form} layout="vertical" variant="outlined" style={{maxWidth: 760}}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(160px, 1fr) minmax(280px, 2fr)',
          gap: spacing.xs,
        }}
      >
        <Form.Item name="name" label={t('name')} rules={[{required: true}]}>
          <Input readOnly={!!model && mode === 'edit'}/>
        </Form.Item>
        <Form.Item name="comment" label={t('comment')}>
          <Input/>
        </Form.Item>
      </div>
      <Form.List
        name="elements"
        rules={[
          {
            validator: async (_, rows: ElementRow[]) => {
              if (!rows || rows.length < 2) {
                return Promise.reject(new Error(t('enum_element_size_valid')));
              }
              const names = rows.map((row) => (row?.name ?? '').trim());
              if (names.some((name) => !name)) {
                return Promise.reject(new Error(t('enum_element_name_required')));
              }
              if (new Set(names).size !== names.length) {
                return Promise.reject(new Error(t('enum_element_name_duplicate')));
              }
              const codes = rows.map((row) => (row?.code ?? '').toString().trim());
              if (codes.some((code) => code !== '') && codes.some((code) => !code)) {
                return Promise.reject(new Error(t('enum_code_partial')));
              }
              const presentCodes = codes.filter((code) => code !== '');
              if (new Set(presentCodes).size !== presentCodes.length) {
                return Promise.reject(new Error(t('enum_code_duplicate')));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, {add, remove}, {errors}) => (
          <Card
            title={t('enum_elements')}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined/>}
                onClick={() => add({name: '', code: '', comment: ''})}
              >
                {t('add_element')}
              </Button>
            }
            styles={{
              body: {padding: spacing.md},
            }}
            style={{borderRadius: rounded.lg}}
          >
            <div style={{...elementGridStyle, marginBottom: spacing.xs}}>
              <Typography.Text type="secondary">{t('element_name')}</Typography.Text>
              <Typography.Text type="secondary">{t('element_code')}</Typography.Text>
              <Typography.Text type="secondary">{t('element_comment')}</Typography.Text>
            </div>
            {fields.map((field, index) => (
              <div
                key={field.key}
                style={{
                  ...elementGridStyle,
                  marginBottom: index === fields.length - 1 ? 0 : spacing.xs,
                }}
              >
                <Form.Item
                  name={[field.name, 'name']}
                  rules={[{required: true, message: t('enum_element_name_required')}]}
                  style={{marginBottom: 0}}
                >
                  <Input/>
                </Form.Item>
                <Form.Item name={[field.name, 'code']} style={{marginBottom: 0}}>
                  <Input placeholder={t('element_code')}/>
                </Form.Item>
                <Form.Item name={[field.name, 'comment']} style={{marginBottom: 0}}>
                  <Input/>
                </Form.Item>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined/>}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              </div>
            ))}
            <Form.ErrorList errors={errors}/>
          </Card>
        )}
      </Form.List>
    </Form>
  );
};

export default EnumForm;