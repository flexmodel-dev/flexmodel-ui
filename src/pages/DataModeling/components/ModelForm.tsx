import React, {useState} from 'react';
import {Form, message, Tabs} from 'antd';
import {useTranslation} from 'react-i18next';
import {Entity} from '@/types/data-modeling';
import EntityForm from './EntityForm';
import EnumForm from './EnumForm';
import NativeQueryForm from './NativeQueryForm';

interface ModelFormProps {
  mode: 'create' | 'edit';
  currentValue?: any;
  onConfirm: (form: any) => void;
  onCancel: () => void;
}

const ModelForm = React.forwardRef<any, ModelFormProps>(({
  mode: _mode,
  currentValue: _currentValue,
  onConfirm,
  onCancel,
}, ref) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Entity');

  React.useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleCancel,
    getFieldsValue: () => {
      switch (activeTab) {
        case 'Entity':
          return entityForm.getFieldsValue();
        case 'Enum':
          return enumForm.getFieldsValue();
        case 'NativeQuery':
          return nativeQueryForm.getFieldsValue();
        default:
          return {};
      }
    },
    setFieldsValue: (values: any) => {
      switch (activeTab) {
        case 'Entity':
          entityForm.setFieldsValue(values);
          break;
        case 'Enum':
          enumForm.setFieldsValue(values);
          break;
        case 'NativeQuery':
          nativeQueryForm.setFieldsValue(values);
          break;
      }
    },
    validateFields: async () => {
      switch (activeTab) {
        case 'Entity':
          return await entityForm.validateFields();
        case 'Enum':
          return await enumForm.validateFields();
        case 'NativeQuery':
          return await nativeQueryForm.validateFields();
        default:
          return {};
      }
    },
  }));

  const [entityForm] = Form.useForm();
  const [entityModel, setEntityModel] = useState<Entity>({
    name: '',
    type: 'Entity',
    fields: [],
    indexes: [],
  });

  const [enumForm] = Form.useForm();

  const [nativeQueryForm] = Form.useForm();

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleEntitySubmit = async () => {
    try {
      const values = await entityForm.validateFields();
      const entityData = {
        ...values,
        type: 'Entity',
        fields: entityModel.fields,
        indexes: entityModel.indexes,
      };
      onConfirm(entityData);
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleEnumSubmit = async () => {
    try {
      const values = await enumForm.validateFields();
      const enumData = {
        ...values,
        type: 'Enum',
      };
      onConfirm(enumData);
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleNativeQuerySubmit = async () => {
    try {
      const values = await nativeQueryForm.validateFields();
      const queryData = {
        ...values,
        type: 'NativeQuery',
      };
      onConfirm(queryData);
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleSubmit = async () => {
    switch (activeTab) {
      case 'Entity':
        await handleEntitySubmit();
        break;
      case 'Enum':
        await handleEnumSubmit();
        break;
      case 'NativeQuery':
        await handleNativeQuerySubmit();
        break;
      default:
        break;
    }
  };

  const handleCancel = () => {
    entityForm.resetFields();
    enumForm.resetFields();
    nativeQueryForm.resetFields();
    setEntityModel({
      name: '',
      type: 'Entity',
      fields: [],
      indexes: [],
    });
    onCancel();
  };

  const items = [
    {
      key: 'Entity',
      label: t('new_entity'),
      children: (
        <EntityForm
          form={entityForm}
          entityModel={entityModel}
          onEntityModelChange={setEntityModel}
        />
      ),
    },
    {
      key: 'Enum',
      label: t('new_enum'),
      children: (
        <EnumForm form={enumForm} />
      ),
    },
    {
      key: 'NativeQuery',
      label: t('new_native_query'),
      children: (
        <NativeQueryForm
          form={nativeQueryForm}
          mode="create"
        />
      ),
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={handleTabChange}
      items={items}
    />
  );
});

export default ModelForm;
