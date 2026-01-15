import React, { useState } from "react";
import { Button, Col, Form, message, Modal, Row, Space, Splitter, Tabs, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import type { StorageSchema } from "@/types/storage";
import StorageExplorer from "@/pages/Storage/components/StorageExplorer";
import {
  deleteStorage,
  updateStorage,
} from "@/services/storage.ts";
import CreateStorageDrawer from "@/pages/Storage/components/CreateStorageDrawer";
import StorageView from "@/pages/Storage/components/StorageView";
import StorageForm from "@/pages/Storage/components/StorageForm";
import FileBrowser from "@/pages/Storage/components/FileBrowser";
import { useProject } from "@/store/appStore";
const { Title } = Typography;

const StorageManagement: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  const [activeStorage, setActiveStorage] = useState<StorageSchema | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('browser');
  const [form] = Form.useForm();

  const handleSelect = (storage: StorageSchema) => {
    if (activeStorage?.name !== storage.name) {
      setActiveStorage(storage);
      setActiveTab('browser');
    }
  };

  const handleEditStorage = async (formData: any) => {
    try {
      await updateStorage(projectId, formData.name, formData as StorageSchema);
      setIsEditing(false);
      if (activeStorage) {
        setActiveStorage(formData as StorageSchema);
      }
      message.success(t("form_save_success"));
    } catch {
      message.error(t("form_save_failed"));
    }
  };

  const handleDelete = async () => {
    if (activeStorage) {
      try {
        await deleteStorage(projectId, activeStorage.name);
        setDeleteVisible(false);
        setActiveStorage(null);
        message.success(t("delete_storage_success"));
      } catch {
        message.error(t("delete_storage_failed"));
      }
    }
  };

  return (
    <>
      <PageContainer>
        <div style={{ padding: token.padding }}>
          <div style={{ marginBottom: token.marginLG, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>{t('storage')}</Title>
          </div>
          <Splitter>
            <Splitter.Panel max="20%" collapsible>
              <div style={{ height: "80vh", overflow: "auto" }}>
                <StorageExplorer
                  onSelect={handleSelect}
                  setDeleteVisible={setDeleteVisible}
                  setDrawerVisible={setDrawerVisible}
                  selectedStorage={activeStorage?.name}
                />
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div style={{ padding: `${token.paddingSM}px ${token.paddingLG}px`, overflow: "auto" }}>
                <div style={{ marginBottom: token.marginMD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={3} style={{ margin: 0 }}>{activeStorage?.name || t('storage')}</Title>
                  <Space>
                    {isEditing ? (
                      <Space>
                        <Button onClick={() => {
                          setIsEditing(false);
                          form.resetFields();
                        }}>{t("cancel")}</Button>
                        <Button type="primary" onClick={async () => {
                          const values = await form.validateFields();
                          await handleEditStorage(values);
                        }}>{t("save")}</Button>
                      </Space>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsEditing(true);
                          form.setFieldsValue(activeStorage);
                        }}
                      >
                        {t("edit")}
                      </Button>
                    )}
                  </Space>
                </div>
                {activeStorage && (
                  <Row>
                    <Col span={24}>
                      {isEditing ? (
                        <Form form={form} layout="vertical">
                          <StorageForm />
                        </Form>
                      ) : (
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                          <Tabs.TabPane key="browser" tab={t('file_browser')}>
                            <FileBrowser storageName={activeStorage.name} projectId={projectId} />
                          </Tabs.TabPane>
                          <Tabs.TabPane key="config" tab={t('configuration')}>
                            <StorageView data={activeStorage} />
                          </Tabs.TabPane>
                        </Tabs>
                      )}
                    </Col>
                  </Row>
                )}
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>

      </PageContainer>
      {/* <PageContainer
        title={activeStorage?.name || t('storage')}
        extra={
          <>
            {isEditing ? (
              <Space>
                <Button onClick={() => {
                  setIsEditing(false);
                  form.resetFields();
                }}>{t("cancel")}</Button>
                <Button type="primary" onClick={async () => {
                  const values = await form.validateFields();
                  await handleEditStorage(values);
                }}>{t("save")}</Button>
              </Space>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setIsEditing(true);
                  form.setFieldsValue(activeStorage);
                }}
              >
                {t("edit")}
              </Button>
            )}
          </>
        }>
        <Layout style={{ height: "100%", background: "transparent" }}>
          <Sider width={320} style={{ background: "transparent", borderRight: "1px solid var(--ant-color-border)" }}>
            <div style={{ height: "100%", overflow: "auto" }}>
              <StorageExplorer
                onSelect={handleSelect}
                setDeleteVisible={setDeleteVisible}
                setDrawerVisible={setDrawerVisible}
                selectedStorage={activeStorage?.name}
              />
            </div>
          </Sider>
          <Content style={{ padding: "12px 20px", overflow: "auto" }}>
            {activeStorage && (
              <Row>
                <Col span={24}>
                  {isEditing ? (
                    <Form form={form} layout="vertical">
                      <StorageForm />
                    </Form>
                  ) : (
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                      <Tabs.TabPane key="browser" tab={t('file_browser')}>
                        <FileBrowser storageName={activeStorage.name} projectId={projectId} />
                      </Tabs.TabPane>
                      <Tabs.TabPane key="config" tab={t('configuration')}>
                        <StorageView data={activeStorage} />
                      </Tabs.TabPane>
                    </Tabs>
                  )}
                </Col>
              </Row>
            )}
          </Content>
        </Layout>
      </PageContainer> */}

      <CreateStorageDrawer
        visible={drawerVisible}
        onChange={(data) => {
          setActiveStorage(data);
        }}
        onClose={() => {
          setDrawerVisible(false);
        }}
      />

      <Modal
        open={deleteVisible}
        title={t("delete_storage_confirm", { name: activeStorage?.name })}
        onCancel={() => setDeleteVisible(false)}
        onOk={handleDelete}
        okText={t("delete")}
        okButtonProps={{ danger: true }}
      >
        <p>
          {t("delete_storage_confirm_desc", { name: activeStorage?.name })}
        </p>
      </Modal>
    </>
  );
};

export default StorageManagement;
