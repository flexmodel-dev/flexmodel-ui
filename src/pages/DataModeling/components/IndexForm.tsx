import React, {useEffect} from "react";
import {Button, Form, Input, Select, Switch} from "antd";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {Index} from "@/types/data-modeling";


interface IndexFormProps {
  mode: 'create' | 'edit';
  model: any;
  currentValue: Index;
  onConfirm: (form: Index) => void;
  onCancel: () => void;
}

const IndexForm = React.forwardRef<any, IndexFormProps>(({
  mode: _mode,
  model,
  currentValue,
  onConfirm,
  onCancel,
}, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  React.useImperativeHandle(ref, () => ({
    submit: handleConfirm,
    reset: handleCancel,
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));

  useEffect(() => {
    if (currentValue && Object.keys(currentValue).length > 0) {
      form.setFieldsValue(currentValue);
    } else {
      const currentFormValues = form.getFieldsValue();
      if (!currentFormValues.name && (!currentFormValues.fields || currentFormValues.fields.length === 0)) {
        form.setFieldsValue({
          name: '',
          fields: [],
          unique: false,
        });
      }
    }
  }, [currentValue, form]);

  const handleConfirm = () => {
    form.validateFields().then((values) => {
      onConfirm(values);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Form form={form} layout="vertical">
        <Form.Item name="name" label={t("name")} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="unique" label={t("unique")} valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.List
          name="fields"
          rules={[
            {
              validator: async (_, fields) => {
                if (!fields || fields.length < 1) {
                  return Promise.reject(new Error(t('index_field_size_valid')));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  label={index === 0 ? t("fields") : ""}
                  required={false}
                  key={field.key}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'fieldName']}
                      validateTrigger={["onChange", "onBlur"]}
                      noStyle
                    >
                      <Select
                        placeholder={t("select_field")}
                        style={{ flex: 1 }}
                      >
                         {model?.fields
                           ?.filter((field: any) => field.type !== 'Relation')
                           ?.map((field: any) => (
                             <Select.Option key={field.name} value={field.name}>
                               {field.name}
                             </Select.Option>
                           ))}
                       </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'direction']}
                      validateTrigger={["onChange", "onBlur"]}
                      noStyle
                    >
                      <Select
                        placeholder={t("direction")}
                        style={{ width: 120 }}
                      >
                        <Select.Option value="ASC">ASC</Select.Option>
                        <Select.Option value="DESC">DESC</Select.Option>
                      </Select>
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </div>
                </Form.Item>
              ))}
              <Form.Item>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    type="dashed"
                    onClick={() => add({ fieldName: '', direction: 'ASC' })}
                    icon={<PlusOutlined />}
                  >
                    {t("add_field")}
                  </Button>
                  <Form.ErrorList errors={errors} />
                </div>
              </Form.Item>
            </>
          )}
        </Form.List>
    </Form>
  );
});

export default IndexForm;
