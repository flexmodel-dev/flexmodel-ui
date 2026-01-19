import React, { useEffect, useState } from "react";
import { Button, Col, Form, Input, message, Modal, Radio, Row, Space, Splitter, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import type { DatasourceSchema } from "@/types/data-source";
import { ScriptImportForm, ScriptType } from "@/types/data-source";
import DataSourceExplorer from "@/pages/DataSource/components/DataSourceExplorer";
import {
  deleteDatasource,
  getDatasourceList,
  importModels as reqImportModels,
  updateDatasource,
  validateDatasource,
} from "@/services/datasource.ts";
import ConnectDatabaseDrawer from "@/pages/DataSource/components/ConnectDatabaseDrawer";
import { buildUpdatePayload, mergeDatasource, normalizeDatasource } from "@/pages/DataSource/utils";
import DataSourceView from "@/pages/DataSource/components/DataSourceView";
import DataSourceForm from "@/pages/DataSource/components/DataSourceForm";
import { getModelList } from "@/services/model.ts";
import { EntitySchema, EnumSchema, NativeQuerySchema, } from "@/types/data-modeling";
import { useProject } from "@/store/appStore";

const { Title } = Typography;

const DatasourceManagement: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [activeDs, setActiveDs] = useState<DatasourceSchema | null>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [importVisible, setImportVisible] = useState<boolean>(false);
  const [exportVisible, setExportVisible] = useState<boolean>(false);
  const [dsList, setDsList] = useState<DatasourceSchema[]>([]);
  const [dsListLoading, setDsListLoading] = useState<boolean>(false);
  const [modelList, setModelList] = useState<
    (EntitySchema | EnumSchema | NativeQuerySchema)[]
  >([]);
  const [form] = Form.useForm();
  const [scriptForm] = Form.useForm<ScriptImportForm>();

  useEffect(() => {
    const fetchDsList = async () => {
      try {
        setDsListLoading(true);
        const list = await getDatasourceList(projectId);
        setDsList(list);
      } catch (error) {
        console.error("Failed to load datasource list:", error);
      } finally {
        setDsListLoading(false);
      }
    };
    fetchDsList();
  }, [projectId]);

  useEffect(() => {
    if (!activeDs && dsList.length > 0) {
      setActiveDs(dsList[0]);
    }
  }, [dsList, activeDs]);

  useEffect(() => {
    const currentType = scriptForm.getFieldValue("type") || ScriptType.IDL;
    if (currentType === ScriptType.IDL) {
      const idls = modelList.map((m: any) => m.idl);
      const idlString = idls.join("\n\n");
      scriptForm.setFieldValue("script", idlString);
    } else {
      const script = {
        schema: modelList.map((m: any) => ({
          ...m,
          idl: undefined,
        })),
        data: [],
      };
      scriptForm.setFieldValue("script", JSON.stringify(script));
    }
  }, [scriptForm, modelList, exportVisible]);

  const handleSelect = (ds: DatasourceSchema) => {
    setActiveDs(ds);
  };

  const handleTestConnection = async () => {
    if (!activeDs) return;
    setTestLoading(true);
    try {
      const result = await validateDatasource(projectId, activeDs);
      if (result.success) {
        message.success(
          t("test_connection_success_message", { time: result.time })
        );
      } else {
        message.error(
          t("test_connection_fail_message", { msg: result.errorMsg })
        );
      }
    } catch (error) {
      console.log(error);
      message.error(t("test_connection_fail_message_2"));
    } finally {
      setTestLoading(false);
    }
  };

  const handleEditDatasource = async (formData: any) => {
    try {
      const payload = buildUpdatePayload(formData);
      await updateDatasource(projectId, formData.name, payload as DatasourceSchema);
      setIsEditing(false);
      if (activeDs) {
        const merged = mergeDatasource(activeDs, formData);
        setActiveDs(merged);
      }
      const list = await getDatasourceList(projectId);
      setDsList(list);
      message.success(t("form_save_success"));
    } catch {
      message.error(t("form_save_failed"));
    }
  };

  const handleDelete = async () => {
    if (activeDs) {
      try {
        await deleteDatasource(projectId, activeDs.name);
        setDeleteVisible(false);
        setActiveDs(null);
        const list = await getDatasourceList(projectId);
        setDsList(list);
        message.success(t("delete_datasource_success"));
      } catch {
        message.error(t("delete_datasource_failed"));
      }
    }
  };

  const handleExport = async () => {
    if (!activeDs) return;
    const models = await getModelList(projectId, activeDs.name);
    setModelList(models);
    setExportVisible(true);
    scriptForm.resetFields();
    scriptForm.setFieldValue("type", ScriptType.IDL);
  };

  const handleImport = () => {
    scriptForm.resetFields();
    setImportVisible(true);
  };

  const importModels = async () => {
    if (!activeDs) return;
    const values = await scriptForm.validateFields();
    reqImportModels(projectId, activeDs.name, values).then(() =>
      message.success(t("models_import_success"))
    );
    setImportVisible(false);
  };

  return (
    <PageContainer
      title={t('datasource')}
      loading={false}>
      <Splitter>
        <Splitter.Panel max="20%" collapsible>
          <div style={{ height: "80vh", overflow: "auto", paddingRight: token.padding }}>
            <DataSourceExplorer
              onSelect={handleSelect}
              setDeleteVisible={setDeleteVisible}
              setDrawerVisible={setDrawerVisible}
              selectedDataSource={activeDs?.name}
              dsList={dsList}
              loading={dsListLoading}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div style={{ padding: `${token.paddingSM}px ${token.paddingLG}px`, overflow: "auto" }}>
            <div style={{
              marginBottom: token.marginMD,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Title level={3} style={{ margin: 0 }}>{activeDs?.name || t('datasource')}</Title>
              <Space>
                {isEditing ? (
                  <Space>
                    <Button onClick={() => {
                      setIsEditing(false);
                      form.resetFields();
                    }}>{t("cancel")}</Button>
                    <Button type="primary" onClick={async () => {
                      const values = await form.validateFields();
                      await handleEditDatasource(values);
                    }}>{t("save")}</Button>
                  </Space>
                ) : (
                  <Space>
                    <Button onClick={handleImport}>{t("import")}</Button>
                    <Button onClick={handleExport}>{t("export")}</Button>
                    <Button onClick={handleTestConnection} loading={testLoading}>
                      {t("test")}
                    </Button>
                    <Button
                      type="primary"
                      disabled={activeDs?.type === "SYSTEM"}
                      onClick={() => {
                        setIsEditing(true);
                        form.setFieldsValue(normalizeDatasource(activeDs as DatasourceSchema));
                      }}
                    >
                      {t("edit")}
                    </Button>
                  </Space>
                )}
              </Space>
            </div>
            {activeDs && (
              <Row>
                <Col span={24}>
                  {isEditing ? (
                    <Form form={form} layout="vertical">
                      <DataSourceForm />
                    </Form>
                  ) : (
                    <DataSourceView data={activeDs} />
                  )}
                </Col>
              </Row>
            )}
          </div>
        </Splitter.Panel>
      </Splitter>
      <ConnectDatabaseDrawer
        visible={drawerVisible}
        onChange={async (data) => {
          setActiveDs(data);
          const list = await getDatasourceList(projectId);
          setDsList(list);
        }}
        onClose={() => {
          setDrawerVisible(false);
        }}
      />

      <Modal
        open={deleteVisible}
        title={t("delete_datasource_confirm", { name: activeDs?.name })}
        onCancel={() => setDeleteVisible(false)}
        onOk={handleDelete}
        okText={t("delete")}
        okButtonProps={{ danger: true }}
      >
        {t("delete_datasource_confirm_desc", { name: activeDs?.name })}
      </Modal>

      <Modal
        width={600}
        open={exportVisible}
        onOk={() => setExportVisible(false)}
        onCancel={() => setExportVisible(false)}
        title={t("export_models_title", { name: activeDs?.name })}
      >
        <Form
          form={scriptForm}
          onValuesChange={(changed) => {
            if (changed.type) {
              if (changed.type === "IDL") {
                const idls = modelList.map((m: any) => m.idl);
                const idlString = idls.join("\n\n");
                scriptForm.setFieldValue("script", idlString);
              } else {
                const script = {
                  schema: modelList.map((m: any) => ({
                    ...m,
                    idl: undefined,
                  })),
                  data: [],
                };
                scriptForm.setFieldValue("script", JSON.stringify(script));
              }
            }
          }}
        >
          <Form.Item label={t("type_label")} name="type">
            <Radio.Group>
              <Radio value="IDL" defaultChecked>IDL</Radio>
              <Radio value="JSON">JSON</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="script">
            <Input.TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        width={600}
        open={importVisible}
        onOk={importModels}
        onCancel={() => setImportVisible(false)}
        title={t("import_models_title", { name: activeDs?.name })}
      >
        <Form form={scriptForm}>
          <Form.Item label={t("type_label")} name="type">
            <Radio.Group>
              <Radio value="IDL" defaultChecked>IDL</Radio>
              <Radio value="JSON">JSON</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="script" required>
            <Input.TextArea rows={10} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DatasourceManagement;
