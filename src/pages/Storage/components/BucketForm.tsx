import React from 'react';
import {Form, Input, InputNumber, Select} from 'antd';
import {useTranslation} from "react-i18next";

interface BucketFormProps {
  readOnly?: boolean;
}

const BucketForm: React.FC<BucketFormProps> = ({readOnly = false}) => {
  const {t} = useTranslation();

  return (
    <>
      <Form.Item
        name="name"
        label={t('bucket_name')}
        rules={[{required: true, message: t('bucket_name_required')}]}
      >
        <Input readOnly={readOnly} placeholder={t('bucket_name_placeholder')} disabled={readOnly}/>
      </Form.Item>

      <Form.Item
        name="description"
        label={t('bucket_description')}
      >
        <Input.TextArea readOnly={readOnly} placeholder={t('bucket_description_placeholder')} rows={3}/>
      </Form.Item>

      <Form.Item
        name="visibility"
        label={t('bucket_visibility')}
        initialValue="PRIVATE"
      >
        <Select disabled={readOnly}>
          <Select.Option value="PRIVATE">{t('visibility_private')}</Select.Option>
          <Select.Option value="AUTHENTICATED">{t('visibility_authenticated')}</Select.Option>
          <Select.Option value="PUBLIC">{t('visibility_public')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="maxFileSize"
        label={t('max_file_size')}
      >
        <InputNumber
          readOnly={readOnly}
          placeholder={t('max_file_size_placeholder')}
          min={1}
          style={{width: '100%'}}
          addonAfter="bytes"
        />
      </Form.Item>
    </>
  );
};

export default BucketForm;
