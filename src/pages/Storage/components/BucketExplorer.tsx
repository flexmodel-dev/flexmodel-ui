import React, {useState, useEffect} from "react";
import {Button, Divider, Dropdown, Spin, theme} from "antd";
import type {MenuProps} from "antd";
import {DatabaseOutlined, DeleteOutlined, FolderOutlined, MoreOutlined} from "@ant-design/icons";
import Tree from "@/components/explore/explore/Tree.jsx";
import "@/components/explore/styles/explore.scss";
import type {BucketSchema} from "@/types/storage";
import {getBucketList} from "@/services/storage.ts";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

interface BucketExplorerProps {
  onSelect: (bucket: BucketSchema) => void;
  setDeleteVisible: (visible: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  selectedBucket?: string;
}

const BucketExplorer: React.FC<BucketExplorerProps> = ({
  onSelect,
  setDeleteVisible,
  setDrawerVisible,
  selectedBucket,
}) => {
  const {token} = theme.useToken();
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  const [bucketList, setBucketList] = useState<BucketSchema[]>([]);
  const [activeBucket, setActiveBucket] = useState<BucketSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getBucketListHandler = async () => {
    try {
      setLoading(true);
      const list = await getBucketList(projectId);
      setBucketList(list);

      let initialActive = null;
      if (selectedBucket) {
        initialActive = list.find(b => b.name === selectedBucket) || null;
      } else {
        initialActive = list[0] || null;
      }

      setActiveBucket(initialActive);
      if (initialActive) {
        onSelect(initialActive);
      }
    } catch (error) {
      console.error("Failed to load bucket list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBucketListHandler();
  }, []);

  useEffect(() => {
    if (selectedBucket && bucketList.length > 0) {
      const bucket = bucketList.find(b => b.name === selectedBucket) || null;
      setActiveBucket(bucket);
      if (bucket) {
        onSelect(bucket);
      }
    }
  }, [selectedBucket, bucketList, onSelect]);

  const treeData = {
    children: bucketList.map((bucket) => ({
      type: 'file' as const,
      filename: bucket.name,
      path: bucket.name,
      bucket,
    }))
  };

  const selectedItem = {
    path: activeBucket?.name || ''
  };

  const renderIcon = (item: any, nodeType: any) => {
    if (nodeType === 'file' && item.bucket) {
      return <DatabaseOutlined style={{fontSize: '16px'}}/>;
    }
    return <FolderOutlined style={{fontSize: '16px'}}/>;
  };

  const renderMore = (item: any) => {
    if (item.bucket) {
      const menuItems: MenuProps["items"] = [
        {
          key: "delete",
          label: t("delete"),
          icon: <DeleteOutlined/>,
          danger: true,
          onClick: (e) => {
            e?.domEvent?.stopPropagation();
            setActiveBucket(item.bucket);
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
      <div style={{margin: token.paddingXS}}>
        <Tree
          tree={treeData}
          selected={selectedItem}
          onClickItem={(item) => {
            setActiveBucket(item.bucket);
            onSelect(item.bucket);
          }}
          renderIcon={renderIcon}
          renderMore={renderMore}
        />

        <Divider style={{margin: `${token.paddingXS}px 0`}}/>
        <Button
          type="primary"
          icon={<DatabaseOutlined/>}
          onClick={() => setDrawerVisible(true)}
          style={{width: "100%"}}
          ghost
        >
          {t("create_bucket")}
        </Button>
      </div>
    </Spin>
  );
};

export default BucketExplorer;
