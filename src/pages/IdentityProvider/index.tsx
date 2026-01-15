import React, {useCallback, useEffect, useState} from "react";
import {Button, Col, Form, message, Modal, Row, Space, Splitter, Typography, theme} from "antd";
import {useTranslation} from "react-i18next";
import type {IdentityProvider} from "@/types/identity-provider";
import IdPExplorer from "@/pages/IdentityProvider/components/IdPExplorer";
import {
  deleteIdentityProvider,
  getIdentityProviders as getIdentityProvidersApi,
  updateIdentityProvider,
} from "@/services/identity-provider.ts";
import CreateIdP from "@/pages/IdentityProvider/components/CreateIdP";
import {buildUpdatePayload, mergeIdentityProvider, normalizeIdentityProvider} from "@/pages/IdentityProvider/utils";
import OIDCIdPForm from "@/pages/IdentityProvider/components/OIDCIdPForm";
import JsIdPForm from "@/pages/IdentityProvider/components/JsIdPForm.tsx";
import IdpView from "@/pages/IdentityProvider/components/IdPView";
import {PageContainer} from "@/components/common";
import {useProject} from "@/store/appStore";
const { Title } = Typography;

const IdPManagement: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [idPList, setIdPList] = useState<IdentityProvider[]>([]);
  const [activeIdP, setActiveIdP] = useState<IdentityProvider | null>(null);
  const [idPLoading, setIdPLoading] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const getIdentityProviders = useCallback(async () => {
    if (!projectId) {
      setIdPLoading(false);
      return;
    }
    
    try {
      setIdPLoading(true);
      const data = await getIdentityProvidersApi(projectId);
      setIdPLoading(false);
      setIdPList(data);
      setActiveIdP(data[0] || null);
    } catch (error) {
      console.log(error);
      message.error(t("identity_provider_load_failed"));
    }
  }, [t, projectId]);

  useEffect(() => {
    getIdentityProviders();
  }, [getIdentityProviders]);

  const handleDelete = async () => {
    if (activeIdP && projectId) {
      try {
        await deleteIdentityProvider(projectId, activeIdP.name);
        getIdentityProviders();
        setDeleteVisible(false);
        message.success(t("identity_provider_delete_success"));
      } catch {
        message.error(t("identity_provider_delete_failed"));
      }
    }
  };

  const handleEditProvider = async (formData: any) => {
    if (!projectId) {
      message.error('Project ID is required');
      return;
    }
    
    try {
      const payload = buildUpdatePayload(formData);
      await updateIdentityProvider(projectId, formData.name, payload);
      setIsEditing(false);
      await getIdentityProviders();
      if (activeIdP) {
        const merged = mergeIdentityProvider(activeIdP, formData);
        setActiveIdP(merged);
      }
      message.success(t("form_save_success"));
    } catch {
      message.error(t("form_save_failed"));
    }
  };

  return (
    <>
      <PageContainer>
        <div style={{ padding: token.padding }}>
          <div style={{ marginBottom: token.marginLG, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>{t("identity_provider")}</Title>
          </div>
          <Splitter>
            <Splitter.Panel max="20%" collapsible>
              <div style={{ height: "80vh", overflow: "auto" }}>
                <IdPExplorer
                  idPList={idPList}
                  activeIdP={activeIdP}
                  loading={idPLoading}
                  setActiveIdP={setActiveIdP}
                  setDeleteVisible={setDeleteVisible}
                  setDrawerVisible={setDrawerVisible}
                  t={t}
                />
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div style={{ padding: `${token.paddingSM}px ${token.paddingLG}px`, overflow: "auto" }}>
              <div style={{ marginBottom: token.marginMD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>{activeIdP?.name || t("identity_provider")}</Title>
                <Space>
                  {isEditing ? (
                    <Space>
                      <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>{t("cancel")}</Button>
                      <Button type="primary" onClick={async () => { const values = await form.validateFields(); await handleEditProvider(values); }}>{t("save")}</Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => { setIsEditing(true); form.setFieldsValue(normalizeIdentityProvider(activeIdP)); }}
                    >
                      {t("edit")}
                    </Button>
                  )}
                </Space>
              </div>
              {idPList.length > 0 && activeIdP && (
                <Row>
                  <Col span={24}>
                    {isEditing ? (
                      <Form form={form} layout="vertical">
                        {(form.getFieldValue('type') ?? activeIdP.type ?? activeIdP.provider?.type) === 'script' ? (
                          <JsIdPForm />
                        ) : (
                          <OIDCIdPForm />
                        )}
                      </Form>
                    ) : (
                      <IdpView data={activeIdP} />
                    )}
                  </Col>
                </Row>
              )}
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </PageContainer>
      <CreateIdP
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onConfirm={(res) => {
          getIdentityProviders().then(() => setActiveIdP(res));
        }}
      />
      <Modal
        open={deleteVisible}
        title={t("identity_provider_delete_confirm", { name: activeIdP?.name })}
        onCancel={() => setDeleteVisible(false)}
        onOk={handleDelete}
        okText={t("delete")}
        okButtonProps={{ danger: true }}
      >
        <p
          dangerouslySetInnerHTML={{
            __html: t("identity_provider_delete_confirm_desc", { name: activeIdP?.name })
          }}
        />
      </Modal>
    </>
  );
};

export default IdPManagement;
