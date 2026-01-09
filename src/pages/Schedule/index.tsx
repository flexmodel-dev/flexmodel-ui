import {TabMenuItem} from "@/components/common/TabMenu.tsx";
import {PlayCircleOutlined, ThunderboltOutlined} from "@ant-design/icons";
import React from 'react';
import {useTranslation} from "react-i18next";
import {useParams} from "react-router-dom";
import TabPageContainer from "../../components/common/TabPageContainer.tsx";
import TriggerList from "./components/TriggerList.tsx";
import JobExecutionLogList from "./components/JobExecutionLogList.tsx";


const Schedule: React.FC = () => {

  const { t } = useTranslation();
  const {projectId} = useParams<{projectId: string}>();

  const projectPrefix = projectId ? `/project/${projectId}` : "";

  const tabItems: TabMenuItem[] = [
    {
      key: "trigger",
      label: t("trigger.title"),
      element: TriggerList,
      icon: <ThunderboltOutlined />,
      path: `${projectPrefix}/schedule/trigger`,
    },
    {
      key: "job_execution_log",
      label: t("job_execution_log"),
      element: JobExecutionLogList,
      icon: <PlayCircleOutlined />,
      path: `${projectPrefix}/schedule/job-execution-log`,
    },
  ];

  return (
    <TabPageContainer
      items={tabItems}
      defaultActiveKey="trigger"
    />
  );
};

export default Schedule;
