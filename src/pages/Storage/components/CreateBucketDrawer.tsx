import React, {useState} from 'react';
import {Button, Drawer, Form, message, Space} from 'antd';
import {createBucket} from "@/services/storage.ts";
import BucketForm from "@/pages/Storage/components/BucketForm";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

const CreateBucketDrawer: React.FC<{
  visible: boolean;
  onChange: (data: any) => void;
  onClose: () => void;
}> = ({visible, onChange, onClose}) => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateBucket = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data = {
        name: values.name,
        description: values.description,
        visibility: values.visibility || 'PRIVATE',
        maxFileSize: values.maxFileSize,
      };
      const res = await createBucket(projectId, data as any);
      onChange(res);
      message.success(t('create_bucket_success'));
      onClose();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(t('create_bucket_failed'));
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
      title={t('create_bucket')}
      width={500}
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
              onClick={handleCreateBucket}
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
          visibility: 'PRIVATE'
        }}
      >
        <BucketForm/>
      </Form>
    </Drawer>
  );
};

export default CreateBucketDrawer;
