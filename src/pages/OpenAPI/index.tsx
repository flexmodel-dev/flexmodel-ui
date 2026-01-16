import React from 'react';
import {useTheme} from '@/store/appStore';
import PageContainer from '@/components/common/PageContainer';
import { t } from 'i18next';
import { Button } from 'antd';

const OpenAPI: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <PageContainer
      title={t('open_api')}
      extra={
        <Button
          type="primary"
          href={`${import.meta.env.BASE_URL}/swagger-ui/index.html?theme=${isDark ? 'dark' : 'light'}`}
          target="_blank"
        >
          {t('open_api_try_it_out')}
        </Button>
      }
    >
      <iframe
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          flex: 1
        }}
        src={`${import.meta.env.BASE_URL}/swagger-ui/index.html?theme=${isDark ? 'dark' : 'light'}`}
        title="OpenAPI Doc"
      />
    </PageContainer>
  );
};

export default OpenAPI;
