import React, { useCallback, useMemo, useState } from "react";
import { Dropdown, theme as antdTheme, Space } from "antd";
import { DownOutlined, LogoutOutlined, QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/store/authStore";
import { useTranslation } from "react-i18next";

interface UserInfoProps {
  isCollapsed?: boolean;
  onHelpClick?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  onHelpClick,
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // 使用认证store中的用户信息，如果没有则使用默认值
  const userName = user?.name || "未知用户";
  const { token } = antdTheme.useToken();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userInfoStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    cursor: 'pointer',
    padding: `0 ${token.paddingXS}px`,
    borderRadius: token.borderRadius,
    transition: 'all 0.3s',
  }), [token.paddingXS, token.borderRadius]);

  // 用户下拉菜单项
  const userMenuItems = useMemo(() => [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: token.colorTextSecondary }} />
            <span style={{ fontSize: token.fontSize, color: token.colorText }}>
              {userName}
            </span>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: t('help'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      danger: true,
    },
  ], [token.colorBorderSecondary, token.colorTextSecondary, token.fontSize, token.colorText, userName, t]);

  // 处理用户菜单点击
  const handleUserMenuClick = useCallback(({ key }: { key: string }) => {
    switch (key) {
      case 'help':
        onHelpClick?.();
        break;
      case 'logout':
        logout();
        break;
    }
    setUserDropdownOpen(false);
  }, [onHelpClick, logout]);

  return (
    <div style={userInfoStyle}>
      <Dropdown
        menu={{
          items: userMenuItems,
          onClick: handleUserMenuClick,
        }}
        open={userDropdownOpen}
        onOpenChange={setUserDropdownOpen}
        styles={{
          root: {
            minWidth: '150px',
          },
        }}
      >
        <Space>
          {userName}
          <DownOutlined />
        </Space>
      </Dropdown>
    </div>
  );
};

export default UserInfo;
