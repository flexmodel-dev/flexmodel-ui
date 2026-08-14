import React, {useEffect} from 'react';
import {Button, Form, Input, Space} from 'antd';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {useTranslation} from 'react-i18next';
import type {Enum} from '@/types/data-modeling';

interface EnumFormProps {
  form?: any;
  mode?: 'create' | 'edit' | 'view';
  datasource?: string;
  model?: Partial<Enum>;
  onConfirm?: (model: Enum) => void;
}

const EnumForm = React.forwardRef<any, EnumFormProps>(({
  form: externalForm,
  mode = 'create',
  datasource: _datasource, // eslint-disable-line @typescript-eslint/no-unused-vars
  model,
  onConfirm
}, ref) => {
  const { t } = useTranslation();
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  // 暴露提交方法给父组件
  React.useImperativeHandle(ref, () => ({
    submit: handleSave,
    reset: () => form.resetFields(),
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));

  // 初始化表单值
  useEffect(() => {
    if (model) {
      form.setFieldsValue(model);
    }
  }, [model, form]);

  // 处理保存
  const handleSave = async () => {
    try {
      await form.validateFields();
      if (onConfirm) {
        onConfirm({
          name: form.getFieldValue("name"),
          type: "Enum",
          elements: form.getFieldValue("elements"),
          comment: form.getFieldValue("comment"),
        });
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  return (
    <Form form={form} layout="vertical" variant={mode === "view" ? "borderless" : "outlined"}>
      <Form.Item
        name="name"
        label={t('name')}
        rules={mode !== 'view' ? [{ required: true }] : []}
      >
        <Input readOnly={mode === 'view' || (!!model && mode === 'edit')} />
      </Form.Item>
      <Form.Item
        name="comment"
        label={t('comment')}
      >
        <Input readOnly={mode === 'view'} />
      </Form.Item>
      <Form.List
        name="elements"
        rules={mode !== 'view' ? [
          {
            validator: async (_, names) => {
              if (!names || names.length < 2) {
                return Promise.reject(new Error(t('enum_element_size_valid')));
              }
            },
          },
        ] : []}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                label={index === 0 ? t("elements") : ''}
                required={false}
                key={field.key}
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  noStyle
                >
                  <Input readOnly={mode === 'view'} suffix={fields.length > 1 && mode !== 'view' ? <MinusCircleOutlined onClick={() => remove(field.name)} /> : null} />
                </Form.Item>

              </Form.Item>
            ))}
            <Form.Item>
              <Space style={{ display: 'flex', gap: 8 }}>
                {mode !== 'view' && (
                  <>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add('', 0);
                      }}
                      icon={<PlusOutlined />}
                    >
                      {t('add_element_at_top')}
                    </Button>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      {t('add_element_at_bottom')}
                    </Button>
                  </>
                )}
                <Form.ErrorList errors={errors} />
              </Space>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
});

export default EnumForm;
