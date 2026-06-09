import React, {useState} from "react";
import {Button, Col, Form, message, Modal, Row, Space, Splitter, Tabs, Typography, theme, Tag} from "antd";
import {useTranslation} from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import type {BucketSchema, StorageProviderInfo} from "@/types/storage";
import BucketExplorer from "@/pages/Storage/components/BucketExplorer";
import {deleteBucket, updateBucket, getStorageProviderInfo} from "@/services/storage.ts";
import BucketView from "@/pages/Storage/components/BucketView";
import BucketForm from "@/pages/Storage/components/BucketForm";
import FileBrowser from "@/pages/Storage/components/FileBrowser";
import {useProject} from "@/store/appStore";
import {CloudOutlined, HddOutlined} from "@ant-design/icons";

const {Title} = Typography;

const StorageManagement: React.FC = () => {
  const {token} = theme.useToken();
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  const [activeBucket, setActiveBucket] = useState<BucketSchema | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [forceDelete, setForceDelete] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('browser');
  const [providerInfo, setProviderInfo] = useState<StorageProviderInfo | null>(null);
  const [bucketRefreshKey, setBucketRefreshKey] = useState<number>(0);
  const [form] = Form.useForm();

  // Load provider info on mount
  React.useEffect(() => {
    getStorageProviderInfo().then(setProviderInfo).catch(() => {});
  }, []);

  const handleSelect = (bucket: BucketSchema) => {
    if (activeBucket?.name !== bucket.name) {
      setActiveBucket(bucket);
      setActiveTab('browser');
    }
  };

  const handleEditBucket = async (formData: any) => {
    try {
      await updateBucket(projectId, formData.name, formData as BucketSchema);
      setIsEditing(false);
      if (activeBucket) {
        setActiveBucket(formData as BucketSchema);
      }
      message.success(t("form_save_success"));
    } catch {
      message.error(t("form_save_failed"));
    }
  };

  const handleDelete = async () => {
    if (activeBucket) {
      try {
        await deleteBucket(projectId, activeBucket.name, forceDelete);
        setDeleteVisible(false);
        setForceDelete(false);
        setActiveBucket(null);
        setBucketRefreshKey(k => k + 1);
        message.success(t("delete_bucket_success"));
      } catch (error: any) {
        if (error?.message?.includes('not empty')) {
          message.error(t("bucket_not_empty"));
        } else {
          message.error(t("delete_bucket_failed"));
        }
      }
    }
  };

  const providerTypeLabel = providerInfo?.type === 's3' ? 'S3' : providerInfo?.type === 'local' ? 'Local' : providerInfo?.type || '-';

  return (
    <>
      <PageContainer
        title={t("storage")}
        bodyStyle={{overflow: 'hidden', padding: 0}}
        extra={
          providerInfo && (
            <Space size="small">
              <Tag icon={providerInfo.type === 's3' ? <CloudOutlined/> : <HddOutlined/>} color="blue">
                {providerTypeLabel}
              </Tag>
              {providerInfo.readOnly && (
                <Tag color="orange">{t('read_only')}</Tag>
              )}
            </Space>
          )
        }
      >
        <Splitter style={{height: '100%'}}>
          <Splitter.Panel max="20%" collapsible>
            <div style={{height: '100%', overflow: 'hidden'}}>
              <BucketExplorer
                onSelect={handleSelect}
                setDeleteVisible={setDeleteVisible}
                selectedBucket={activeBucket?.name}
                refreshKey={bucketRefreshKey}
              />
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={{height: '100%', padding: `${token.paddingSM}px ${token.paddingLG}px`, overflow: "auto"}}>
              <div style={{
                marginBottom: token.marginMD,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Title level={3} style={{margin: 0}}>{activeBucket?.name || t('storage')}</Title>
                <Space>
                  {isEditing ? (
                    <Space>
                      <Button onClick={() => {
                        setIsEditing(false);
                        form.resetFields();
                      }}>{t("cancel")}</Button>
                      <Button type="primary" onClick={async () => {
                        const values = await form.validateFields();
                        await handleEditBucket(values);
                      }}>{t("save")}</Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        setIsEditing(true);
                        form.setFieldsValue(activeBucket);
                      }}
                      disabled={!activeBucket}
                    >
                      {t("edit")}
                    </Button>
                  )}
                </Space>
              </div>
              {activeBucket && (
                <Row>
                  <Col span={24}>
                    {isEditing ? (
                      <Form form={form} layout="vertical">
                        <BucketForm/>
                      </Form>
                    ) : (
                      <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <Tabs.TabPane key="browser" tab={t('file_browser')}>
                          <FileBrowser bucketName={activeBucket.name} projectId={projectId}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane key="config" tab={t('configuration')}>
                          <BucketView data={activeBucket}/>
                        </Tabs.TabPane>
                      </Tabs>
                    )}
                  </Col>
                </Row>
              )}
            </div>
          </Splitter.Panel>
        </Splitter>

      </PageContainer>

      <Modal
        open={deleteVisible}
        title={t("delete_bucket_confirm", {name: activeBucket?.name})}
        onCancel={() => {
          setDeleteVisible(false);
          setForceDelete(false);
        }}
        onOk={handleDelete}
        okText={t("delete")}
        okButtonProps={{danger: true}}
      >
        <p>{t("delete_bucket_confirm_desc", {name: activeBucket?.name})}</p>
        <div style={{marginTop: 12}}>
          <label>
            <input
              type="checkbox"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
            />
            {' '}{t('force_delete')} — {t('force_delete_desc')}
          </label>
        </div>
      </Modal>
    </>
  );
};

export default StorageManagement;
