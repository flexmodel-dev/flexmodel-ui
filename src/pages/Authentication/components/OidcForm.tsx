import React from "react";
import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";

const OidcForm: React.FC = () => {
  const { t } = useTranslation();
  const issuer = Form.useWatch?.("issuer");

  return (
    <>
      <Form.Item
        label={t("oidc_issuer")}
        name="issuer"
        rules={[{ required: true, message: t("oidc_issuer_required") }]}
      >
        <Input placeholder="e.g. http://localhost:8080/realms/master" />
      </Form.Item>

      {issuer && (
        <Form.Item label={t("oidc_discovery_endpoint")}>
          <span style={{ wordBreak: "break-all", color: "#888" }}>
            {issuer}/.well-known/openid-configuration
          </span>
        </Form.Item>
      )}

      <Form.Item
        label={t("oidc_client_id")}
        name="clientId"
        rules={[{ required: true, message: t("oidc_client_id_required") }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={t("oidc_client_secret")}
        name="clientSecret"
        rules={[{ required: true, message: t("oidc_client_secret_required") }]}
      >
        <Input.Password />
      </Form.Item>
    </>
  );
};

export default OidcForm;
