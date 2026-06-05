import React, {useState} from 'react';
import {Button, Drawer, Form, message, Space} from 'antd';
import {CheckCircleOutlined} from '@ant-design/icons';
import {createStorage, validateStorage} from "@/services/storage.ts";
import StorageForm from "@/pages/Storage/components/StorageForm";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

const CreateStorageDrawer: React.FC<{
  visible: boolean;
  onChange: (data: any) => void;
  onClose: () => void;
}> = ({ visible, onChange, onClose }) => {
  const { t } = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);

  const handleValidateStorage = async () => {
    try {
      setValidating(true);
      const values = await form.validateFields();
      const data = {
        name: values.name || 'validation-test',
        type: values.type,
        config: values.config,
        enabled: values.enabled ?? true,
        createdAt: '',
        updatedAt: ''
      };
      const result = await validateStorage(projectId, data);
      if (result.success) {
        message.success(t('storage_validate_success', {time: result.time}));
      } else {
        message.error(t('storage_validate_failed', {error: result.errorMsg}));
      }
    } catch (error) {
      console.error(error);
      message.error(t('storage_validate_failed', {error: String(error)}));
    } finally {
      setValidating(false);
    }
  };

  const handleCreateStorage = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data = {
        name: values.name,
        type: values.type,
        config: values.config,
        enabled: values.enabled ?? true,
        createdAt: '',
        updatedAt: ''
      };
      const res = await createStorage(projectId, data);
      onChange(res);
      message.success(t('create_storage_success'));
      onClose();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(t('create_storage_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Drawer
      title={t('create_storage')}
      width={600}
      placement="right"
      onClose={handleClose}
      open={visible}
      footer={
        <div style={{textAlign: 'right'}}>
          <Space>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={handleValidateStorage}
              loading={validating}
            >
              {t('validate_connection')}
            </Button>
            <Button onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="primary"
              onClick={handleCreateStorage}
              loading={loading}
            >
              {t('create')}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'S3',
          enabled: true
        }}
      >
        <StorageForm />
      </Form>
    </Drawer>
  );
};

export default CreateStorageDrawer;
