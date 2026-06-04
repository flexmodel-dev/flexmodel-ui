import React, { useState } from "react";
import { Button, Form, Input, message, Modal, Radio, Space, Steps } from "antd";
import { useTranslation } from "react-i18next";
import { useProject } from "@/store/appStore";
import { createAuthProvider } from "@/services/auth-provider";
import type { AuthProviderConfig } from "@/types/auth-provider";
import OidcForm from "@/pages/Authentication/components/OidcForm";
import ScriptForm from "@/pages/Authentication/components/ScriptForm";

interface CreateProviderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateProviderModal: React.FC<CreateProviderModalProps> = ({ open, onClose, onCreated }) => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [providerType, setProviderType] = useState<"oidc" | "script">("oidc");

  const resetState = () => {
    setCurrentStep(0);
    setProviderType("oidc");
    form.resetFields();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const { name, ...configFields } = values;
      const payload: AuthProviderConfig = {
        name,
        type: providerType,
        enabled: true,
        config: configFields,
      };
      await createAuthProvider(projectId, payload);
      message.success(t("provider_created"));
      setCurrentStep(2);
      onCreated();
    } catch {
      message.error(t("provider_create_failed"));
    }
  };

  return (
    <Modal
      title={t("create_provider")}
      open={open}
      onCancel={handleClose}
      width={640}
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            {currentStep !== 2 && (
              <Button onClick={handleClose}>{t("cancel")}</Button>
            )}
            {currentStep === 0 && (
              <Button
                type="primary"
                onClick={() => {
                  const name = form.getFieldValue("name");
                  if (!name) {
                    message.error(t("name_required"));
                    return;
                  }
                  setCurrentStep(1);
                }}
              >
                {t("next")}
              </Button>
            )}
            {currentStep === 1 && (
              <Button type="primary" onClick={handleCreate}>
                {t("create")}
              </Button>
            )}
            {currentStep === 2 && (
              <Button type="primary" onClick={handleClose}>
                {t("close")}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps
        current={currentStep}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: t("step_select_type") },
          { title: t("step_configure") },
          { title: t("step_done") },
        ]}
      />

      <Form form={form} layout="vertical">
        {currentStep === 0 && (
          <>
            <Form.Item name="name" label={t("name")} rules={[{ required: true, message: t("name_required") }]}>
              <Input placeholder={t("provider_name_placeholder")} />
            </Form.Item>
            <Form.Item label={t("type")}>
              <Radio.Group value={providerType} onChange={(e) => setProviderType(e.target.value)}>
                <Radio value="oidc">OpenID Connect (OIDC)</Radio>
                <Radio value="script">{t("script")} (Script)</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}

        {currentStep === 1 && providerType === "oidc" && <OidcForm />}
        {currentStep === 1 && providerType === "script" && <ScriptForm />}

        {currentStep === 2 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontSize: 16, color: "#52c41a" }}>{t("provider_created")}</p>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CreateProviderModal;
