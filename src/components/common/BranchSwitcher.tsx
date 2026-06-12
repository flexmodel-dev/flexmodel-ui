import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  Spin,
  Radio,
  theme as antdTheme,
} from "antd";
import {
  BranchesOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useProject } from "@/store/appStore";
import { createBranch, deleteBranch, mergeBranch } from "@/services/branch";
import { getProject } from "@/services/project";
import { useNavigate, useLocation } from "react-router-dom";
import type { BranchCreateRequest, ConflictStrategy } from "@/types/branch";

interface BranchSwitcherProps {
  projectId: string;
  onMenuItemsChange?: (items: any[]) => void;
}

/** 分支名校验正则：小写字母开头，由小写字母、数字和下划线组成，长度2~63 */
const BRANCH_NAME_REGEX = /^[a-z][a-z0-9_]{1,62}$/;

const BranchSwitcher: React.FC<BranchSwitcherProps> = ({ projectId, onMenuItemsChange }) => {
  const { t } = useTranslation();
  const { token } = antdTheme.useToken();
  const { currentProject, setCurrentProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  // 确定父项目 ID（如果当前是分支项目，使用 parentProjectId）
  const parentProjectId = currentProject?.parentProjectId || projectId;

  // 创建分支弹窗
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // 管理分支弹窗
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);

  // 合并分支弹窗
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeForm] = Form.useForm();

  // 从项目 ID 推导当前分支名（Supabase 风格：每个分支是独立项目）
  const currentBranch = currentProject?.parentProjectId
    ? projectId.slice(currentProject.parentProjectId.length + 1)
    : "main";
  const branches = currentProject?.branches ?? [];

  const refreshProject = useCallback(async () => {
    try {
      const project = await getProject(projectId);
      setCurrentProject(project);
    } catch (err) {
      console.error("Failed to refresh project:", err);
    }
  }, [projectId, setCurrentProject]);

  const handleSwitch = useCallback(
    async (branchName: string) => {
      if (branchName === currentBranch) return;
      try {
        // Supabase 风格：导航到分支项目 URL
        const targetProjectId = branchName === "main" ? parentProjectId : `${parentProjectId}_${branchName}`;
        // 保持当前路径的后续部分不变
        const currentPath = location.pathname;
        const projectPrefix = `/project/${projectId}`;
        const suffix = currentPath.startsWith(projectPrefix)
          ? currentPath.slice(projectPrefix.length)
          : "";
        navigate(`/project/${targetProjectId}${suffix}`);
      } catch (err: any) {
        message.error(err?.message || t("branch.switchFailed"));
      }
    },
    [projectId, parentProjectId, currentBranch, navigate, location, t],
  );

  const handleCreate = useCallback(async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await createBranch(projectId, values as BranchCreateRequest);
      message.success(t("branch.createSuccess", { name: values.name }));
      setCreateModalOpen(false);
      createForm.resetFields();
      await refreshProject();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.message || t("branch.createFailed"));
    } finally {
      setCreateLoading(false);
    }
  }, [projectId, createForm, refreshProject, t]);

  const handleDelete = useCallback(
    async (branchName: string) => {
      try {
        setManageLoading(true);
        await deleteBranch(projectId, branchName);
        message.success(t("branch.deleteSuccess", { name: branchName }));
        await refreshProject();
      } catch (err: any) {
        message.error(err?.message || t("branch.deleteFailed"));
      } finally {
        setManageLoading(false);
      }
    },
    [projectId, refreshProject, t],
  );

  const handleMerge = useCallback(async () => {
    try {
      const values = await mergeForm.validateFields();
      setMergeLoading(true);
      await mergeBranch(projectId, {
        sourceBranch: values.sourceBranch,
        targetBranch: values.targetBranch,
        conflictStrategy: values.conflictStrategy as ConflictStrategy,
      });
      message.success(t("branch.mergeSuccess"));
      setMergeModalOpen(false);
      mergeForm.resetFields();
      await refreshProject();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || t("branch.mergeFailed"));
    } finally {
      setMergeLoading(false);
    }
  }, [projectId, mergeForm, refreshProject, t]);

  const branchNameValidator = useCallback((_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t("branch.nameRequired")));
    }
    if (!BRANCH_NAME_REGEX.test(value)) {
      return Promise.reject(new Error(t("branch.nameFormatError")));
    }
    if (value === "main") {
      return Promise.reject(new Error(t("branch.nameMainError")));
    }
    return Promise.resolve();
  }, [t]);

  const breadcrumbMenuItems = useMemo(() => {
    const branchItems = branches.map((branch) => ({
      key: branch.name,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BranchesOutlined style={{ color: branch.name === currentBranch ? token.colorPrimary : token.colorTextSecondary }} />
          <span style={{ fontWeight: branch.name === 'main' ? 600 : 400 }}>{branch.name}</span>
          {branch.name === 'main' && (
            <Tag color="default" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>main</Tag>
          )}
        </span>
      ),
      onClick: () => handleSwitch(branch.name),
      disabled: branch.name === currentBranch,
    }));

    return [
      ...branchItems,
      { type: 'divider' as const },
      {
        key: '__create__',
        label: t('branch.createBranch'),
        icon: <PlusOutlined />,
        onClick: () => setCreateModalOpen(true),
      },
      {
        key: '__merge__',
        label: t('branch.mergeBranch'),
        icon: <MergeCellsOutlined />,
        onClick: () => setMergeModalOpen(true),
      },
      {
        key: '__manage__',
        label: t('branch.manageBranches'),
        icon: <SettingOutlined />,
        onClick: () => setManageModalOpen(true),
      },
    ];
  }, [branches, currentBranch, handleSwitch, t, token]);

  useEffect(() => {
    onMenuItemsChange?.(breadcrumbMenuItems);
  }, [breadcrumbMenuItems, onMenuItemsChange]);

  return (
    <>
      <span className="cursor-pointer">
        <BranchesOutlined style={{ marginRight: token.marginXS }} />
        <span>{currentBranch}</span>
      </span>

      {/* 创建分支弹窗 */}
      <Modal
        title={t("branch.createBranch")}
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        confirmLoading={createLoading}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" initialValues={{ sourceBranch: "main" }}>
          <Form.Item
            label={t("branch.name")}
            name="name"
            rules={[{ validator: branchNameValidator }]}
            extra={t("branch.nameFormatHint")}
          >
            <Input placeholder={t("branch.namePlaceholder")} />
          </Form.Item>
          <Form.Item label={t("branch.sourceBranch")} name="sourceBranch">
            <Select
              options={branches.map((b) => ({ label: b.name, value: b.name }))}
            />
          </Form.Item>
          <Form.Item label={t("branch.description")} name="description">
            <Input.TextArea rows={2} placeholder={t("branch.descriptionPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 管理分支弹窗 */}
      <Modal
        title={t("branch.manageBranches")}
        open={manageModalOpen}
        onCancel={() => setManageModalOpen(false)}
        footer={null}
        width={480}
      >
        <Spin spinning={manageLoading}>
          <List
            dataSource={branches}
            renderItem={(item) => {
              const isCurrent = item.name === currentBranch;
              const canDelete = item.name !== "main" && !isCurrent;
              return (
                <List.Item
                  actions={
                    canDelete
                      ? [
                          <Popconfirm
                            key="delete"
                            title={t("branch.deleteConfirm", { name: item.name })}
                            onConfirm={() => handleDelete(item.name)}
                            okText={t("common.confirm")}
                            cancelText={t("common.cancel")}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            />
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <div style={{ display: "flex", alignItems: "center", gap: token.marginXS }}>
                    <BranchesOutlined />
                    <span style={{ fontWeight: item.name === "main" ? 600 : 400 }}>{item.name}</span>
                    {item.name === "main" && (
                      <Tag color="default" style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                        main
                      </Tag>
                    )}
                    {isCurrent && (
                      <Tag color="processing" style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}>
                        {t("branch.active")}
                      </Tag>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </Spin>
      </Modal>

      {/* 合并分支弹窗 */}
      <Modal
        title={t("branch.mergeBranch")}
        open={mergeModalOpen}
        onOk={handleMerge}
        onCancel={() => {
          setMergeModalOpen(false);
          mergeForm.resetFields();
        }}
        confirmLoading={mergeLoading}
        destroyOnClose
      >
        <Form form={mergeForm} layout="vertical" initialValues={{ targetBranch: "main", conflictStrategy: "SKIP" }}>
          <Form.Item
            label={t("branch.mergeSourceBranch")}
            name="sourceBranch"
            rules={[{ required: true, message: t("branch.mergeSourceBranchRequired") }]}
          >
            <Select
              placeholder={t("branch.mergeSourceBranchPlaceholder")}
              options={branches
                .filter((b) => b.name !== currentBranch)
                .map((b) => ({ label: b.name, value: b.name }))}
            />
          </Form.Item>
          <Form.Item
            label={t("branch.mergeTargetBranch")}
            name="targetBranch"
            rules={[{ required: true, message: t("branch.mergeTargetBranchRequired") }]}
          >
            <Select
              options={branches
                .map((b) => ({ label: b.name, value: b.name }))}
            />
          </Form.Item>
          <Form.Item
            label={t("branch.conflictStrategy")}
            name="conflictStrategy"
            rules={[{ required: true }]}
            extra={t("branch.conflictStrategyHint")}
          >
            <Radio.Group>
              <Radio value="SKIP">{t("branch.conflictSkip")}</Radio>
              <Radio value="OVERWRITE">{t("branch.conflictOverwrite")}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BranchSwitcher;
