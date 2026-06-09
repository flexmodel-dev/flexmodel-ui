import React from 'react';
import {Descriptions, theme} from 'antd';
import type {BucketSchema} from "@/types/storage";
import {useTranslation} from "react-i18next";

interface BucketViewProps {
  data: BucketSchema;
}

const BucketView: React.FC<BucketViewProps> = ({data}) => {
  const {t} = useTranslation();
  const {token} = theme.useToken();

  const visibilityLabel = data.visibility === 'PUBLIC'
    ? t('visibility_public')
    : data.visibility === 'AUTHENTICATED'
      ? t('visibility_authenticated')
      : t('visibility_private');

  return (
    <Descriptions
      column={1}
      bordered
      style={{marginTop: token.marginMD}}
    >
      <Descriptions.Item label={t('bucket_name')}>{data.name}</Descriptions.Item>
      <Descriptions.Item label={t('bucket_description')}>{data.description || '-'}</Descriptions.Item>
      <Descriptions.Item label={t('bucket_visibility')}>{visibilityLabel}</Descriptions.Item>
      <Descriptions.Item label={t('max_file_size')}>
        {data.maxFileSize ? `${(data.maxFileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('created_at')}>{data.createdAt || '-'}</Descriptions.Item>
      <Descriptions.Item label={t('updated_at')}>{data.updatedAt || '-'}</Descriptions.Item>
    </Descriptions>
  );
};

export default BucketView;
