import React from "react";
import { Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common";
import ApiKeysTab from "@/pages/Authentication/components/ApiKeysTab";
import ProvidersTab from "@/pages/Authentication/components/ProvidersTab";

const Authentication: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer title={t("authentication")}>
      <Tabs
        defaultActiveKey="api-keys"
        items={[
          {
            key: "api-keys",
            label: t("api_keys"),
            children: <ApiKeysTab />,
          },
          {
            key: "providers",
            label: t("providers"),
            children: <ProvidersTab />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default Authentication;
