import React, {useState, useEffect} from "react";
import {Button, Divider, Dropdown, Spin, theme} from "antd";
import type {MenuProps} from "antd";
import {CloudOutlined, DeleteOutlined, FolderOutlined, MoreOutlined} from "@ant-design/icons";
import Tree from "@/components/explore/explore/Tree.jsx";
import "@/components/explore/styles/explore.scss";
import type {StorageSchema} from "@/types/storage";
import {getStorageList} from "@/services/storage.ts";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

interface StorageExplorerProps {
  onSelect: (storage: StorageSchema) => void;
  setDeleteVisible: (visible: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  selectedStorage?: string;
}

const StorageExplorer: React.FC<StorageExplorerProps> = ({
  onSelect,
  setDeleteVisible,
  setDrawerVisible,
  selectedStorage,
}) => {
  const { token } = theme.useToken();
  const {t} = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [storageList, setStorageList] = useState<StorageSchema[]>([]);
  const [activeStorage, setActiveStorage] = useState<StorageSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getStorageListHandler = async () => {
    try {
      setLoading(true);
      const list = await getStorageList(projectId);
      setStorageList(list);

      let initialActiveStorage = null;
      if (selectedStorage) {
        initialActiveStorage = list.find(s => s.name === selectedStorage) || null;
      } else {
        initialActiveStorage = list[0] || null;
      }

      setActiveStorage(initialActiveStorage);
      if (initialActiveStorage) {
        onSelect(initialActiveStorage);
      }
    } catch (error) {
      console.error("Failed to load storage list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStorageListHandler();
  }, []);

  useEffect(() => {
    if (selectedStorage && storageList.length > 0) {
      const storage = storageList.find(s => s.name === selectedStorage) || null;
      setActiveStorage(storage);
      if (storage) {
        onSelect(storage);
      }
    }
  }, [selectedStorage, storageList, onSelect]);

  const treeData = {
    children: storageList.map((storage) => ({
      type: 'file' as const,
      filename: storage.name,
      path: storage.name,
      storage,
    }))
  };

  const selectedItem = {
    path: activeStorage?.name || ''
  };

  const renderIcon = (item: any, nodeType: any) => {
    if (nodeType === 'file' && item.storage) {
      return <CloudOutlined style={{fontSize: '16px'}}/>;
    }
    return <FolderOutlined style={{fontSize: '16px'}}/>;
  };

  const renderMore = (item: any) => {
    if (item.storage) {
      const menuItems: MenuProps["items"] = [
        {
          key: "delete",
          label: t("delete"),
          icon: <DeleteOutlined/>,
          danger: true,
          onClick: (e) => {
            e?.domEvent?.stopPropagation();
            setActiveStorage(item.storage);
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
          <MoreOutlined
            className="cursor-pointer opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      );
    }
    return null;
  };

  return (
    <Spin spinning={loading}>
      <div style={{minWidth: 200, margin: token.paddingXS}}>
        <Tree
          tree={treeData}
          selected={selectedItem}
          onClickItem={(item) => {
            setActiveStorage(item.storage);
            onSelect(item.storage);
          }}
          renderIcon={renderIcon}
          renderMore={renderMore}
        />

        <Divider style={{margin: `${token.paddingXS}px 0`}}/>
        <Button
          type="primary"
          icon={<CloudOutlined/>}
          onClick={() => setDrawerVisible(true)}
          style={{width: "100%"}}
          ghost
        >
          {t("create_storage")}
        </Button>
      </div>
    </Spin>
  );
};

export default StorageExplorer;
