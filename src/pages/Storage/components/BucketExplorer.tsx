import React, {useState, useEffect, useMemo} from "react";
import {Button, Dropdown, Form, Input, List, message, Modal, Spin, theme, Typography} from "antd";
import type {MenuProps} from "antd";
import {DatabaseOutlined, DeleteOutlined, MoreOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import type {BucketSchema} from "@/types/storage";
import {createBucket, getBucketList} from "@/services/storage.ts";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";
import BucketForm from "@/pages/Storage/components/BucketForm";

const {Text} = Typography;

interface BucketExplorerProps {
  onSelect: (bucket: BucketSchema) => void;
  setDeleteVisible: (visible: boolean) => void;
  selectedBucket?: string;
  refreshKey?: number;
}

const BucketExplorer: React.FC<BucketExplorerProps> = ({
  onSelect,
  setDeleteVisible,
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
  const [filterText, setFilterText] = useState<string>("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

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

  const handleCreateBucket = async () => {
    try {
      setCreateLoading(true);
      const values = await createForm.validateFields();
      const data = {
        name: values.name,
        description: values.description,
        visibility: values.visibility || 'PRIVATE',
        maxFileSize: values.maxFileSize,
      };
      const res = await createBucket(projectId, data as any);
      message.success(t('create_bucket_success'));
      setCreateModalVisible(false);
      createForm.resetFields();
      await getBucketListHandler();
      onSelect(res);
    } catch (error) {
      console.error(error);
      message.error(t('create_bucket_failed'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateClose = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const filteredBucketList = useMemo(() => {
    if (!filterText) return bucketList;
    const keyword = filterText.toLowerCase();
    return bucketList.filter(b => b.name.toLowerCase().includes(keyword));
  }, [bucketList, filterText]);

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

  const searchRowStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 8px 8px 8px',
    gap: '8px',
  };

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', padding: '4px 0'}}>
      <div style={searchRowStyle}>
        <Input
          placeholder={t("search_buckets")}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{width: '100%', borderRadius: 6}}
          allowClear
          prefix={<SearchOutlined/>}
        />
        <Button
          icon={<PlusOutlined/>}
          onClick={() => setCreateModalVisible(true)}
        />
      </div>

      <div style={{flex: 1, minHeight: 0, overflow: 'auto', padding: '0 4px'}}>
        <Spin spinning={loading}>
          <List
            dataSource={filteredBucketList}
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
                        color: isActive ? token.colorText : token.colorTextTertiary,
                        flexShrink: 0,
                      }}/>
                      <Text
                        ellipsis
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 500 : 400,
                          lineHeight: '1.4',
                          color: isActive ? token.colorText : token.colorTextSecondary,
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
                          color: token.colorTextTertiary,
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
        </Spin>
      </div>
      <Modal
        title={t('create_bucket')}
        width={500}
        open={createModalVisible}
        onCancel={handleCreateClose}
        onOk={handleCreateBucket}
        okText={t('create')}
        cancelText={t('cancel')}
        confirmLoading={createLoading}
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{visibility: 'PRIVATE'}}
          style={{marginTop: 16}}
        >
          <BucketForm/>
        </Form>
      </Modal>
    </div>
  );
};

export default BucketExplorer;
