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
  const [activeTab, setActiveTab] = useState('entity');

  React.useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: handleCancel,
    getFieldsValue: () => {
      switch (activeTab) {
        case 'entity':
          return entityForm.getFieldsValue();
        case 'enum':
          return enumForm.getFieldsValue();
        case 'nativeQuery':
          return nativeQueryForm.getFieldsValue();
        default:
          return {};
      }
    },
    setFieldsValue: (values: any) => {
      switch (activeTab) {
        case 'entity':
          entityForm.setFieldsValue(values);
          break;
        case 'enum':
          enumForm.setFieldsValue(values);
          break;
        case 'nativeQuery':
          nativeQueryForm.setFieldsValue(values);
          break;
      }
    },
    validateFields: async () => {
      switch (activeTab) {
        case 'entity':
          return await entityForm.validateFields();
        case 'enum':
          return await enumForm.validateFields();
        case 'nativeQuery':
          return await nativeQueryForm.validateFields();
        default:
          return {};
      }
    },
  }));

  const [entityForm] = Form.useForm();
  const [entityModel, setEntityModel] = useState<Entity>({
    name: '',
    type: 'entity',
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
        type: 'entity',
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
        type: 'enum',
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
        type: 'native_query',
      };
      onConfirm(queryData);
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleSubmit = async () => {
    switch (activeTab) {
      case 'entity':
        await handleEntitySubmit();
        break;
      case 'enum':
        await handleEnumSubmit();
        break;
      case 'nativeQuery':
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
      type: 'entity',
      fields: [],
      indexes: [],
    });
    onCancel();
  };

  const items = [
    {
      key: 'entity',
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
      key: 'enum',
      label: t('new_enum'),
      children: (
        <EnumForm form={enumForm} />
      ),
    },
    {
      key: 'nativeQuery',
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
