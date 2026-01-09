import React from "react";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router-dom";
import DataModeling from "@/pages/DataModeling";
import DataSource from "@/pages/DataSource";
import ERView from "./components/ERView";
import {BranchesOutlined, ContainerOutlined, DatabaseOutlined,} from "@ant-design/icons";
import TabPageContainer from "@/components/common/TabPageContainer";
import {TabMenuItem} from "@/components/common/TabMenu";

const DataView: React.FC = () => {
  const { t } = useTranslation();
  const {projectId} = useParams<{projectId: string}>();

  const projectPrefix = projectId ? `/project/${projectId}` : "";

  const tabItems: TabMenuItem[] = [
    {
      key: "modeling",
      label: t("data_modeling"),
      element: DataModeling,
      icon: <ContainerOutlined />,
      path: `${projectPrefix}/data/modeling`,
    },
    {
      key: "source",
      label: t("data_source"),
      element: DataSource,
      icon: <DatabaseOutlined />,
      path: `${projectPrefix}/data/source`,
    },
    {
      key: "er",
      label: t("er_view"),
      element: ERView,
      icon: <BranchesOutlined />,
      path: `${projectPrefix}/data/er`,
    },
  ];

  return (
    <TabPageContainer
      items={tabItems}
      defaultActiveKey="modeling"
    />
  );
};

export default DataView;
