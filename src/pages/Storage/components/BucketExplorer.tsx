import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Button, Empty, Form, Input, message, Modal, Spin, theme} from "antd";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
import type {BucketSchema} from "@/types/storage";
import {createBucket, getBucketList} from "@/services/storage.ts";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";
import BucketForm from "@/pages/Storage/components/BucketForm";
import BucketItem from "@/pages/Storage/components/BucketItem";

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
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // 保持最新的 onSelect / selectedBucket 引用，避免它们的变化导致 fetch 重复触发。
  // 父组件未对 onSelect 做 useCallback，每次渲染都是新引用，若作为依赖会导致
  // getBucketListHandler 重建 → useEffect 重复请求 bucket 列表。
  const onSelectRef = useRef(onSelect);
  const selectedBucketRef = useRef(selectedBucket);
  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedBucketRef.current = selectedBucket;
  });

  // 根据名称在列表中定位并选中 bucket，未命中则回退到第一项。
  const selectByName = useCallback((list: BucketSchema[], name?: string) => {
    const target = (name && list.find(b => b.name === name)) || list[0] || null;
    setActiveBucket(target);
    if (target) onSelectRef.current(target);
  }, []);

  const getBucketListHandler = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getBucketList(projectId);
      setBucketList(list);
      selectByName(list, selectedBucketRef.current);
    } catch (error) {
      console.error("Failed to load bucket list:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectByName]);

  useEffect(() => {
    getBucketListHandler();
  }, [refreshKey, getBucketListHandler]);

  // 外部 selectedBucket 变化时同步高亮（列表已加载的场景）。
  useEffect(() => {
    if (selectedBucket && bucketList.length > 0) {
      selectByName(bucketList, selectedBucket);
    }
  }, [selectedBucket, bucketList, selectByName]);

  const handleCreateBucket = async () => {
    try {
      setCreateLoading(true);
      const values = await createForm.validateFields();
      const data = {
        name: values.name,
        description: values.description,
        visibility: values.visibility || 'PRIVATE',
        maxFileSize: values.maxFileSize ? values.maxFileSize * 1024 * 1024 : undefined,
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

  const handleDelete = useCallback((bucket: BucketSchema) => {
    setActiveBucket(bucket);
    setDeleteVisible(true);
  }, [setDeleteVisible]);

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', padding: `${token.paddingXXS}px 0`}}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 8px 12px 8px',
        gap: '8px',
      }}>
        <Input
          placeholder={t("search_buckets")}
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{width: '100%'}}
          allowClear
          prefix={<SearchOutlined/>}
        />
        <Button
          icon={<PlusOutlined/>}
          size="small"
          onClick={() => setCreateModalVisible(true)}
        />
      </div>

      <div style={{flex: 1, minHeight: 0, overflow: 'auto', padding: `0 ${token.paddingXXS}px`}}>
        <Spin spinning={loading} size="small" style={{minHeight: 200}}>
          {filteredBucketList.length === 0 && !loading ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{margin: '100px 0'}}/>
          ) : (
            filteredBucketList.map((bucket) => (
              <BucketItem
                key={bucket.name}
                bucket={bucket}
                active={activeBucket?.name === bucket.name}
                onSelect={onSelect}
                onDelete={handleDelete}
              />
            ))
          )}
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
          style={{marginTop: token.marginMD}}
        >
          <BucketForm/>
        </Form>
      </Modal>
    </div>
  );
};

export default BucketExplorer;
