import React, {useState} from 'react';
import {Button, Drawer, Form, message, Space} from 'antd';
import {createStorage} from "@/services/storage.ts";
import StorageForm from "@/pages/Storage/components/StorageForm";
import {useTranslation} from "react-i18next";

const CreateStorageDrawer: React.FC<{
  visible: boolean;
  onChange: (data: any) => void;
  onClose: () => void;
}> = ({ visible, onChange, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

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
      const res = await createStorage(data);
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
