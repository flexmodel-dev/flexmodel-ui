import React, {useEffect, useState} from "react";
import {Button, message, Space} from "antd";
import {SettingOutlined} from "@ant-design/icons";
import GraphQL from "./components/GraphQL";
import {getSettings} from "@/services/settings";
import {Settings} from "@/types/settings";
import {useAppStore, useConfig, useProject} from "@/store/appStore";
import GraphQLSettingsModal from "./components/GraphQLSettingsModal";
import PageContainer from "@/components/common/PageContainer";
import {useTranslation} from "react-i18next";

const GraphQLAPI: React.FC = () => {
  const {config} = useConfig();
  const {currentProject} = useProject();
  const {t} = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const {currentTenant} = useAppStore();

  const projectId = currentProject?.id || '';

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      if (!projectId) return;
      try {
        const settingsData = await getSettings(projectId);
        setSettings(settingsData);
      } catch (error) {
        console.error(t('config_load_failed'), error);
        message.error(t('config_load_failed'));
      }
    };

    loadSettings();
  }, [projectId, t]);

  // 设置更新回调
  const handleSettingsUpdate = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
    setSettingsModalVisible(false);
  };

  return (
    <PageContainer
      title={settings?.security.graphqlEndpointPath ?
        `${t('graphql_endpoint')}: ${config?.apiRootPath + "/" + currentTenant?.id || ''}${settings.security.graphqlEndpointPath}` :
        t('graphql_api_title')
      }
      extra={
        <Space>
          <Button
            type="text"
            icon={<SettingOutlined/>}
            onClick={() => setSettingsModalVisible(true)}
          >
            {t('graphql_settings')}
          </Button>
        </Space>
      }
    >
      <GraphQL
        data={{
          query: `
# 欢迎使用Flexmodel GraphQL API
# 使用前请先熟悉语法文档：https://www.graphql.org/learn/ ， 以下为一些指令的示例
# 转换结果： 在使用 GraphQL 查询数据时，由于查询的层级可能较深，有时需要将多层嵌套的数据进行扁平化处理，以便于前端使用。
# query MyQuery {
#   courses: system_list_Student(where: {studentName: {_in: ["李四", "王五"]}}) {
#     classId
#     studentName
#   }
#   total: system_aggregate_Student(where: {studentName: {_in: ["李四", "王五"]}}) @transform(get: "_count") {
#     _count
#     _max {
#       age
#     }
#   }
#   maxAge: system_aggregate_Student(where: {studentName: {_in: ["李四", "王五"]}}) @transform(get: "_max.age") {
#     _max {
#       age
#     }
#   }
# }
# 将 @transform 作用于对象/数组类型的选择集上，将其拍扁，提取出对应的字段。
# 跨源关联： 将前一个查询的返回值作为参数传递给下一个查询。
# query MyQuery($studentId: Int @internal) {
#   courses: system_list_Student(where: {studentName: {_in: ["李四", "王五"]}}) {
#     id @export(as: "studentId")
#     classId
#     studentName
#     courses {
#       courseName
#       courseNo
#     }
#     _join {
#       detail: system_find_one_StudentDetail(where: {studentId: {_eq: $studentId}}) {
#         description
#       }
#     }
#   }
# }
#
# 通过 @export 导出参数，在_join中引用，参数名必须与导出的参数名一致。
# 通过 @internal 指定是一个内部参数，不返回给客户端。
#


`,
        }}
        onChange={(data) => {
          console.log('graphql onChange: ', data);
        }}
      />

      {/* 设置对话框 */}
      <GraphQLSettingsModal
        visible={settingsModalVisible}
        settings={settings}
        onCancel={() => setSettingsModalVisible(false)}
        onSuccess={handleSettingsUpdate}
      />
    </PageContainer>
  );
};

export default GraphQLAPI;
