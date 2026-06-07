import React from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/common";
import ProvidersTab from "@/pages/Authentication/components/ProvidersTab";

const Authentication: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer title={t("authentication")}>
      <ProvidersTab />
    </PageContainer>
  );
};

export default Authentication;
