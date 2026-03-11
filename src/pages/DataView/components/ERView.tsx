import React, {useEffect, useState} from "react";
import {notification} from "antd";
import {useTranslation} from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import {getModelList} from "@/services/model";
import ERDiagram from "@/pages/DataModeling/components/ERDiagramView";
import type {Entity} from "@/types/data-modeling";
import {useProject} from "@/store/appStore";

const ERView: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [models, setModels] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const modelList = await getModelList(projectId);
        const entityModels = modelList.filter(model => model.type === "entity") as Entity[];
        setModels(entityModels);
      } catch (error) {
        console.error(t("get_model_list_failed"), error);
        notification.error({
          message: t("get_model_list_failed"),
          description: t("get_model_list_failed_desc")
        });
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [t, projectId]);

  return (
    <PageContainer loading={loading}>
      <ERDiagram data={models} />
    </PageContainer>
  );
};

export default ERView;
