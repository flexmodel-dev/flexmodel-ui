import React, {useEffect} from 'react';
import {Button, Form, Input, Space} from 'antd';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import type {Enum} from '@/types/data-modeling';
import {buildEnumPayload, toElementRows, type ElementRow} from './enumPayload';

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

  return (
    <Form form={form} layout="vertical" variant={mode === "view" ? "borderless" : "outlined"}>
      <Form.Item
        name="name"
        label={t('name')}
        rules={mode !== 'view' ? [{required: true}] : []}
      >
        <Input readOnly={mode === 'view' || (!!model && mode === 'edit')}/>
      </Form.Item>
      <Form.Item
        name="comment"
        label={t('comment')}
      >
        <Input readOnly={mode === 'view'}/>
      </Form.Item>
      <Form.List
        name="elements"
        rules={mode !== 'view' ? [
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
        ] : []}
      >
        {(fields, {add, remove}, {errors}) => (
          <>
            <div style={{display: 'flex', gap: 8, marginBottom: 4}}>
              <div style={{flex: 1}}>{t('element_name')}</div>
              <div style={{width: 120}}>{t('element_code')}</div>
              <div style={{flex: 1}}>{t('element_comment')}</div>
              <div style={{width: 32}}/>
            </div>
            {fields.map((field) => (
              <div key={field.key} style={{display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center'}}>
                <Form.Item
                  name={[field.name, 'name']}
                  rules={mode !== 'view' ? [{required: true, message: t('enum_element_name_required')}] : []}
                  style={{flex: 1, marginBottom: 0}}
                >
                  <Input readOnly={mode === 'view'}/>
                </Form.Item>
                <Form.Item
                  name={[field.name, 'code']}
                  style={{width: 120, marginBottom: 0}}
                >
                  <Input readOnly={mode === 'view'} placeholder={mode === 'view' ? '' : t('element_code')}/>
                </Form.Item>
                <Form.Item
                  name={[field.name, 'comment']}
                  style={{flex: 1, marginBottom: 0}}
                >
                  <Input readOnly={mode === 'view'}/>
                </Form.Item>
                <div style={{width: 32}}>
                  {fields.length > 1 && mode !== 'view' && (
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined/>}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              </div>
            ))}
            <Form.Item>
              <Space style={{display: 'flex', gap: 8}}>
                {mode !== 'view' && (
                  <>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add({name: '', code: '', comment: ''}, 0);
                      }}
                      icon={<PlusOutlined/>}
                    >
                      {t('add_element_at_top')}
                    </Button>
                    <Button
                      type="dashed"
                      onClick={() => add({name: '', code: '', comment: ''})}
                      icon={<PlusOutlined/>}
                    >
                      {t('add_element_at_bottom')}
                    </Button>
                  </>
                )}
                <Form.ErrorList errors={errors}/>
              </Space>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default EnumForm;