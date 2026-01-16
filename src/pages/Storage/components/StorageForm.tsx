import React from 'react';
import { Form, Input, InputNumber, Radio, Switch } from 'antd';
import { useTranslation } from "react-i18next";

interface StorageFormProps {
  readOnly?: boolean;
}

const StorageForm: React.FC<StorageFormProps> = ({ readOnly = false }) => {
  const { t } = useTranslation();

  const storageType = Form.useWatch('type');

  return (
    <>
      <Form.Item
        name="name"
        label={t('storage_name')}
        rules={[{ required: true, message: t('storage_name_required') }]}
      >
        <Input readOnly={readOnly} placeholder={t('storage_name_placeholder')} />
      </Form.Item>

      <Form.Item
        name="type"
        label={t('storage_type')}
        rules={[{ required: true, message: t('storage_type_required') }]}
      >
        <Radio.Group disabled={readOnly}>
          <Radio value="S3">S3</Radio>
          <Radio value="LOCAL">{t('local_storage')}</Radio>
        </Radio.Group>
      </Form.Item>

      {storageType === 'S3' && (
        <>
          <Form.Item
            name={['config', 'accessKey']}
            label={t('s3_access_key')}
            rules={[{ required: true, message: t('s3_access_key_required') }]}
          >
            <Input.Password readOnly={readOnly} placeholder={t('s3_access_key_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'secretKey']}
            label={t('s3_secret_key')}
            rules={[{ required: true, message: t('s3_secret_key_required') }]}
          >
            <Input.Password readOnly={readOnly} placeholder={t('s3_secret_key_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'bucket']}
            label={t('s3_bucket')}
            rules={[{ required: true, message: t('s3_bucket_required') }]}
          >
            <Input readOnly={readOnly} placeholder={t('s3_bucket_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'region']}
            label={t('s3_region')}
            rules={[{ required: true, message: t('s3_region_required') }]}
          >
            <Input readOnly={readOnly} placeholder={t('s3_region_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'endpoint']}
            label={t('s3_endpoint')}
          >
            <Input readOnly={readOnly} placeholder={t('s3_endpoint_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'pathStyle']}
            label={t('s3_path_style')}
            valuePropName="checked"
          >
            <Switch disabled={readOnly} />
          </Form.Item>
        </>
      )}

      {storageType === 'LOCAL' && (
        <>
          <Form.Item
            name={['config', 'basePath']}
            label={t('local_base_path')}
            rules={[{ required: true, message: t('local_base_path_required') }]}
          >
            <Input readOnly={readOnly} placeholder={t('local_base_path_placeholder')} />
          </Form.Item>

          <Form.Item
            name={['config', 'maxFileSize']}
            label={t('local_max_file_size')}
            rules={[{ required: true, message: t('local_max_file_size_required') }]}
          >
            <InputNumber
              readOnly={readOnly}
              placeholder={t('local_max_file_size_placeholder')}
              min={1}
              style={{ width: '100%' }}
              addonAfter="bytes"
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        name="enabled"
        label={t('enabled')}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch disabled={readOnly} />
      </Form.Item>
    </>
  );
};

export default StorageForm;
