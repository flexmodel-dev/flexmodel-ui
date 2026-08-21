import React, {useCallback, useEffect, useState} from "react";
import {Button, Card, Descriptions, message, Popconfirm, Space, Spin, Tag, Typography, Upload,} from "antd";
import {
  CloudOutlined,
  DesktopOutlined,
  ExpandOutlined,
  GlobalOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import type {PageSiteResponse} from "@/services/pages";
import {deployUpload, getPageSite, setProductionDeployment,} from "@/services/pages";
import {useConfig} from "@/store/appStore";

const {Text, Link} = Typography;

interface PagesTabProps {
  projectId: string;
}

const PagesTab: React.FC<PagesTabProps> = ({projectId}) => {
  const {t} = useTranslation();
  const {config} = useConfig();

  const [pageSite, setPageSite] = useState<PageSiteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // 用于刷新 iframe

  const refreshIframe = () => setIframeKey(k => k + 1);

  const loadPageSite = useCallback(async () => {
    await Promise.resolve();
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getPageSite(projectId);
      setPageSite(res);
    } catch {
      message.error(t("pages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    loadPageSite();
  }, [loadPageSite]);

  const handleUpload = async (file: File) => {
    setDeploying(true);
    try {
      const res = await deployUpload(projectId, file);
      setPageSite(res);
      message.success(t("pages.deploySuccess"));
    } catch {
      message.error(t("pages.deployFailed"));
    } finally {
      setDeploying(false);
    }
    return false; // prevent default upload behavior
  };

  const handleSetProduction = async (deploymentId: string) => {
    try {
      const res = await setProductionDeployment(projectId, deploymentId);
      setPageSite(res);
      message.success(t("pages.setProductionSuccess"));
    } catch {
      message.error(t("pages.setProductionFailed"));
    }
  };

  const rawUrl = (config.pagesUrlTemplate || "/pages/{{projectId}}")
    .replace("{{projectId}}", projectId);
  // If the template is a relative path, prepend the current origin to form a full URL
  const siteUrl = rawUrl.startsWith("/") ? `${window.location.origin}${rawUrl}` : rawUrl;

  if (loading && !pageSite) {
    return (
      <div style={{textAlign: "center", padding: 48}}>
        <Spin/>
      </div>
    );
  }

  return (
    <>
      {/* Site URL */}
      <Card
        title={t("pages.siteUrl")}
        style={{marginBottom: 16}}
        extra={
          <Button icon={<ReloadOutlined/>} onClick={loadPageSite} size="small">
            {t("refresh")}
          </Button>
        }
      >
        <Link href={siteUrl} target="_blank" style={{fontSize: 16}}>
          <GlobalOutlined style={{marginRight: 8}}/>
          {siteUrl}
        </Link>
      </Card>

      {/* Preview */}
      {pageSite && pageSite.status === "READY" ? (
        <Card
          title={
            <Space>
              <DesktopOutlined/>
              <span>{t("pages.preview")}</span>
            </Space>
          }
          style={{marginBottom: 16}}
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined/>}
                size="small"
                onClick={refreshIframe}
              >
                {t("pages.refreshPreview")}
              </Button>
              <Button
                icon={<ExpandOutlined/>}
                size="small"
                onClick={() => window.open(siteUrl, "_blank")}
              >
                {t("pages.openInNewTab")}
              </Button>
            </Space>
          }
        >
          <div
            style={{
              border: "1px solid var(--ant-color-border-secondary)",
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
              minHeight: 200,
            }}
          >
            <iframe
              key={iframeKey}
              src={siteUrl}
              style={{
                width: "100%",
                height: 500,
                border: "none",
                display: "block",
              }}
              title="Pages Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </Card>
      ) : null}

      {/* Deployment Info */}
      <Card
        title={t("pages.currentDeployment")}
        style={{marginBottom: 16}}
      >
        {pageSite ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={t("pages.status")}>
              <Tag color={pageSite.status === "READY" ? "success" : "error"}>
                {pageSite.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("pages.deploymentId")}>
              {pageSite.productionDeploymentId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("pages.fileCount")}>
              {pageSite.fileCount}
            </Descriptions.Item>
            <Descriptions.Item label={t("pages.sizeBytes")}>
              {pageSite.sizeBytes > 0
                ? `${(pageSite.sizeBytes / 1024).toFixed(1)} KB`
                : "0"}
            </Descriptions.Item>
            {pageSite.errorMessage && (
              <Descriptions.Item label={t("pages.errorMessage")} span={2}>
                <Text type="danger">{pageSite.errorMessage}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <Text type="secondary">{t("pages.noDeployment")}</Text>
        )}
      </Card>

      {/* Upload */}
      <Card title={t("pages.deploy")} style={{marginBottom: 16}}>
        <Upload
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          showUploadList={false}
          accept=".zip"
          disabled={deploying}
        >
          <Button
            type="primary"
            icon={<UploadOutlined/>}
            loading={deploying}
          >
            {deploying ? t("pages.deploying") : t("pages.uploadZip")}
          </Button>
        </Upload>
        <Text type="secondary" style={{marginLeft: 16}}>
          {t("pages.uploadHint")}
        </Text>
      </Card>

      {/* Set Production (for rollback) */}
      {pageSite?.productionDeploymentId && (
        <Card title={t("pages.rollback")} style={{marginBottom: 16}}>
          <Space>
            <Text>{t("pages.rollbackHint")}</Text>
            <Popconfirm
              title={t("pages.rollbackConfirm")}
              onConfirm={() => handleSetProduction(pageSite!.productionDeploymentId!)}
              okText={t("confirm")}
              cancelText={t("cancel")}
            >
              <Button icon={<CloudOutlined/>}>
                {t("pages.refreshProduction")}
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      )}
    </>
  );
};

export default PagesTab;
