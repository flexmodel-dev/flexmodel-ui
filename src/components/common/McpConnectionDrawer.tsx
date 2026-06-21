import React, { useMemo } from "react";
import { Drawer, Typography, theme as antdTheme } from "antd";
import { useTranslation } from "react-i18next";

interface McpConnectionDrawerProps {
  open: boolean;
  onClose: () => void;
}

const McpConnectionDrawer: React.FC<McpConnectionDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { token } = antdTheme.useToken();
  const mcpUrl = useMemo(() => `${window.location.origin}/api/mcp?api_key=<your_api_key>`, []);

  return (
    <Drawer
      title={t('platform.mcp_drawer_title')}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnHidden
    >
      <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_overview_title')}</Typography.Paragraph>
      <Typography.Paragraph>{t('platform.mcp_overview_desc')}</Typography.Paragraph>

      <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_endpoint_title')}</Typography.Paragraph>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: token.marginSM,
        padding: token.padding,
        backgroundColor: token.colorFillQuaternary,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        marginBottom: token.marginLG,
      }}>
        <Typography.Text code copyable={{ text: mcpUrl }} style={{ flex: 1, wordBreak: 'break-all' }}>{mcpUrl}</Typography.Text>
      </div>

      <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_tools_title')}</Typography.Paragraph>
      <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginSM, marginBottom: token.marginLG }}>
        {[
          { label: t('platform.mcp_project_tools'), desc: t('platform.mcp_project_tools_desc') },
          { label: t('platform.mcp_modeling_tools'), desc: t('platform.mcp_modeling_tools_desc') },
          { label: t('platform.mcp_data_tools'), desc: t('platform.mcp_data_tools_desc') },
        ].map((item) => (
          <div key={item.label} style={{
            padding: token.padding,
            backgroundColor: token.colorFillQuaternary,
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}>
            <Typography.Text strong>{item.label}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>{item.desc}</Typography.Text>
          </div>
        ))}
      </div>

      <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG }}>{t('platform.mcp_config_title')}</Typography.Paragraph>
      <Typography.Text type="secondary">{t('platform.mcp_config_subtitle')}</Typography.Text>
      <pre style={{
        padding: token.padding,
        backgroundColor: token.colorFillQuaternary,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'auto',
        marginTop: token.marginSM,
        marginBottom: token.marginSM,
      }}>{JSON.stringify({ mcpServers: { flexmodel: { url: mcpUrl } } }, null, 2)}</pre>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>{t('platform.mcp_config_note')}</Typography.Text>

      <Typography.Paragraph strong style={{ fontSize: token.fontSizeLG, marginTop: token.marginLG }}>{t('platform.mcp_scenarios_title')}</Typography.Paragraph>
      <ul style={{ paddingLeft: token.paddingLG }}>
        {[
          t('platform.mcp_scenario_1'),
          t('platform.mcp_scenario_2'),
          t('platform.mcp_scenario_3'),
          t('platform.mcp_scenario_4'),
        ].map((scenario, i) => (
          <li key={i} style={{ marginBottom: token.marginXS }}>
            <Typography.Text>{scenario}</Typography.Text>
          </li>
        ))}
      </ul>
    </Drawer>
  );
};

export default McpConnectionDrawer;
