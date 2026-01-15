import React from "react";
import {Button, Divider, Dropdown, Spin, theme} from "antd";
import type {MenuProps} from "antd";
import {KeyOutlined, MoreOutlined, PlusOutlined, SafetyCertificateOutlined, UserOutlined} from "@ant-design/icons";
// 导入Tree组件
import Tree from "@/components/explore/explore/Tree.jsx";
// 导入Tree样式
import "@/components/explore/styles/explore.scss";
import type {IdentityProvider} from "@/types/identity-provider";

// removed custom scss usage

interface IdPExplorerProps {
  idPList: IdentityProvider[];
  activeIdP: IdentityProvider | null;
  loading: boolean;
  setActiveIdP: (idp: IdentityProvider) => void;
  setDeleteVisible: (visible: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  t: (key: string) => string;
}

const IdPExplorer: React.FC<IdPExplorerProps> = ({
  idPList,
  activeIdP,
  loading,
  setActiveIdP,
  setDeleteVisible,
  setDrawerVisible,
  t,
}) => {
  const { token } = theme.useToken();
  
  // 将身份提供商列表转换为Tree组件需要的数据结构
  const treeData = {
    children: idPList.map((idp) => ({
      type: 'file' as const,
      filename: idp.name,
      path: idp.name,
      identityProvider: idp, // 保存原始身份提供商对象
    }))
  };

  // 当前选中的身份提供商
  const selectedItem = {
    path: activeIdP?.name || ''
  };

  // 自定义图标渲染函数
  const renderIcon = (item: any, nodeType: any) => {
    if (nodeType === 'file' && item.identityProvider) {
      const providerType = item.identityProvider.provider?.type || item.identityProvider.type;

      // 根据身份提供商类型显示不同图标
      switch (providerType?.toLowerCase()) {
        case 'script':
        case 'oidc':
          return <SafetyCertificateOutlined />;
        case 'saml':
          return <KeyOutlined />;
        case 'system':
          return <UserOutlined />;
        default:
          return <UserOutlined />;
      }
    }
    return <div />;
  };

  // 更多按钮渲染函数
  const renderMore = (item: any) => {
    if (item.identityProvider && item.identityProvider.type !== "system") {
      const menuItems: MenuProps["items"] = [
        {
          key: "delete",
          label: <span style={{ color: "red" }}>{t("delete")}</span>,
          danger: true,
          onClick: (e) => {
            e?.domEvent?.stopPropagation();
            setActiveIdP(item.identityProvider);
            setDeleteVisible(true);
          },
        },
      ];

      return (
        <Dropdown
          menu={{items: menuItems}}
          trigger={["hover"]}
          placement="bottomRight"
        >
          <MoreOutlined onClick={(e) => e.stopPropagation()} style={{ marginLeft: '8px', cursor: 'pointer' }} />
        </Dropdown>
      );
    }
    return null;
  };

  return (
    <div style={{ minWidth: 200 }}>
      <Spin spinning={loading}>
        <Tree
          tree={treeData}
          selected={selectedItem}
          onClickItem={(item) => setActiveIdP(item.identityProvider)}
          renderIcon={renderIcon}
          renderMore={renderMore}
        />
      </Spin>
      <Divider style={{ margin: `${token.paddingXS}px 0` }} />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setDrawerVisible(true)}
        style={{ width: "100%" }}
        ghost
      >
        {t("idp_new_provider")}
      </Button>
    </div>
  );
};

export default IdPExplorer;
