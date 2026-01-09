import React, {useEffect, useState} from "react";
import {notification, Select} from "antd";
import {useTranslation} from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import {getDatasourceList} from "@/services/datasource";
import {getModelList} from "@/services/model";
import ERDiagram from "@/pages/DataModeling/components/ERDiagramView";
import type {DatasourceSchema} from "@/types/data-source";
import type {Entity} from "@/types/data-modeling";
import {useProject} from "@/store/appStore";

const ERView: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [datasources, setDatasources] = useState<DatasourceSchema[]>([]);
  const [selectedDatasource, setSelectedDatasource] = useState<string>("");
  const [models, setModels] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取数据源列表
  useEffect(() => {
    const fetchDatasources = async () => {
      try {
        const dsList = await getDatasourceList(projectId);
        setDatasources(dsList);
        if (dsList.length > 0) {
          setSelectedDatasource(dsList[0].name);
        }
      } catch (error) {
        console.error(t("get_datasource_list_failed"), error);
        notification.error({
          title: t("get_datasource_list_failed"),
          description: t("get_datasource_list_failed_desc")
        });
      }
    };
    fetchDatasources();
  }, [t, projectId]);

  // 获取模型列表
  useEffect(() => {
    if (!selectedDatasource) return;

    const fetchModels = async () => {
      setLoading(true);
      try {
        const modelList = await getModelList(projectId, selectedDatasource);
        // 过滤出实体类型的模型
        const entityModels = modelList.filter(model => model.type === "entity") as Entity[];
        setModels(entityModels);
      } catch (error) {
        console.error(t("get_model_list_failed"), error);
        notification.error({
          title: t("get_model_list_failed"),
          description: t("get_model_list_failed_desc")
        });
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedDatasource, t, projectId]);

  const handleDatasourceChange = (value: string) => {
    setSelectedDatasource(value);
  };

  return (
    <PageContainer
      loading={loading}
      title={t("er_view")}
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select
            value={selectedDatasource}
            onChange={handleDatasourceChange}
            style={{ minWidth: 150 }}
            placeholder={t("select_datasource")}
            loading={datasources.length === 0}
          >
            {datasources.map(ds => (
              <Select.Option key={ds.name} value={ds.name}>
                {ds.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      }
    >
      <ERDiagram data={models} />
    </PageContainer>
  );
};

export default ERView;
