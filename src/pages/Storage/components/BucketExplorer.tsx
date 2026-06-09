import React, {useState, useEffect} from "react";
import {Button, Divider, Dropdown, List, Spin, theme, Typography} from "antd";
import type {MenuProps} from "antd";
import {DatabaseOutlined, DeleteOutlined, MoreOutlined} from "@ant-design/icons";
import type {BucketSchema} from "@/types/storage";
import {getBucketList} from "@/services/storage.ts";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

const {Text} = Typography;

interface BucketExplorerProps {
  onSelect: (bucket: BucketSchema) => void;
  setDeleteVisible: (visible: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  selectedBucket?: string;
  refreshKey?: number;
}

const BucketExplorer: React.FC<BucketExplorerProps> = ({
  onSelect,
  setDeleteVisible,
  setDrawerVisible,
  selectedBucket,
  refreshKey = 0,
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
  }, [refreshKey]);

  useEffect(() => {
    if (selectedBucket && bucketList.length > 0) {
      const bucket = bucketList.find(b => b.name === selectedBucket) || null;
      setActiveBucket(bucket);
      if (bucket) {
        onSelect(bucket);
      }
    }
  }, [selectedBucket, bucketList, onSelect]);

  const menuItems = (bucket: BucketSchema): MenuProps["items"] => [
    {
      key: "delete",
      label: t("delete"),
      icon: <DeleteOutlined/>,
      danger: true,
      onClick: () => {
        setActiveBucket(bucket);
        setDeleteVisible(true);
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{margin: token.paddingXS}}>
        <List
          dataSource={bucketList}
          renderItem={(bucket) => {
            const isActive = activeBucket?.name === bucket.name;
            return (
              <List.Item
                onClick={() => {
                  setActiveBucket(bucket);
                  onSelect(bucket);
                }}
                style={{
                  padding: '8px 12px',
                  marginBottom: 4,
                  borderRadius: 10,
                  cursor: 'pointer',
                  backgroundColor: isActive ? token.colorFillSecondary : 'transparent',
                  border: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = token.colorFillTertiary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 8,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <DatabaseOutlined style={{
                      fontSize: 16,
                      color: isActive ? token.colorText : '#41454d',
                      flexShrink: 0,
                    }}/>
                    <Text
                      ellipsis
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 500 : 400,
                        lineHeight: '1.4',
                        color: isActive ? token.colorText : '#333840',
                      }}
                    >
                      {bucket.name}
                    </Text>
                  </div>
                  <Dropdown
                    menu={{items: menuItems(bucket)}}
                    trigger={["hover"]}
                    placement="bottomRight"
                  >
                    <MoreOutlined
                      style={{
                        fontSize: 16,
                        color: '#41454d',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              </List.Item>
            );
          }}
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
