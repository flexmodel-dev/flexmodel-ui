import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
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
  Progress,
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
import type {
  BranchCreateRequest,
  BranchProgressEvent,
  BranchProgressOperation,
  ConflictStrategy,
} from "@/types/branch";

interface BranchSwitcherProps {
  projectId: string;
  onMenuItemsChange?: (items: any[]) => void;
}

interface BranchProgressState {
  operation: BranchProgressOperation;
  events: BranchProgressEvent[];
}

interface BranchProgressPanelProps {
  events: BranchProgressEvent[];
  title: string;
  percent: number;
  failure: boolean;
  completed: boolean;
}

const BranchProgressPanel: React.FC<BranchProgressPanelProps> = ({
                                                                   events,
                                                                   title,
                                                                   percent,
                                                                   failure,
                                                                   completed,
                                                                 }) => {
  const {t} = useTranslation();
  const {token} = antdTheme.useToken();
  const visibleEvents = events.filter(
    (event) => event.type !== "STARTED" && event.type !== "COMPLETED",
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.marginXS,
        marginTop: token.marginSM,
      }}
    >
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span>{title}</span>
        <span>{percent}%</span>
      </div>
      <Progress
        percent={percent}
        size="small"
        status={failure ? "exception" : completed ? "success" : "active"}
      />
      <div style={{maxHeight: 220, overflowY: "auto"}}>
        {visibleEvents.length === 0 && (
          <div style={{color: token.colorTextSecondary}}>{t("branch.progressPreparing")}</div>
        )}
        {visibleEvents.map((event) => (
          <div
            key={`${event.stage}-${event.modelName ?? ""}-${event.type}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: token.marginXS,
              padding: `${token.paddingXXS}px 0`,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.modelName ?? t(`branch.stage${event.stage}`)}
            </span>
            <span style={{display: "flex", alignItems: "center", gap: token.marginXS}}>
              {event.type === "MODEL_COMPLETED" && (
                <span>
                  {t("branch.progressRecords", {
                    inserted: event.insertedRecords ?? 0,
                    updated: event.updatedRecords ?? 0,
                  })}
                </span>
              )}
              {(event.type === "FAILED" || event.type === "MODEL_FAILED") && (
                <span>{event.message}</span>
              )}
              <Tag
                color={
                  event.type === "MODEL_STARTED"
                    ? "processing"
                    : event.type === "MODEL_COMPLETED" || event.type === "STAGE_COMPLETED"
                      ? "success"
                      : event.type === "MODEL_FAILED" || event.type === "FAILED"
                        ? "error"
                        : "default"
                }
              >
                {t(`branch.progress${event.type}`)}
              </Tag>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [branchProgress, setBranchProgress] = useState<BranchProgressState | null>(null);
  const [mergeForm] = Form.useForm();

  // 从项目 ID 推导当前分支名（Supabase 风格：每个分支是独立项目）
  const currentBranch = currentProject?.parentProjectId
    ? projectId.slice(currentProject.parentProjectId.length + 1)
    : "main";
  const branches = useMemo(() => currentProject?.branches ?? [], [currentProject?.branches]);

  const refreshProject = useCallback(async () => {
    try {
      const project = await getProject(projectId);
      setCurrentProject(project);
    } catch (err) {
      console.error("Failed to refresh project:", err);
    }
  }, [projectId, setCurrentProject]);

  const startBranchProgress = useCallback((operation: BranchProgressOperation) => {
    setBranchProgress({operation, events: []});
  }, []);

  const clearBranchProgress = useCallback(() => {
    setBranchProgress(null);
  }, []);

  const appendBranchProgressEvent = useCallback((event: BranchProgressEvent) => {
    setBranchProgress((previous) => {
      if (!previous || previous.operation !== event.operation) {
        return previous;
      }

      const events = [...previous.events];
      if (event.modelName) {
        const index = events.findIndex(
          (item) => item.modelName === event.modelName && item.stage === event.stage,
        );
        if (index >= 0) {
          events[index] = event;
        } else {
          events.push(event);
        }
      } else {
        events.push(event);
      }

      return {...previous, events};
    });
  }, []);

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
      startBranchProgress("CREATE");
      await createBranch(projectId, values as BranchCreateRequest, appendBranchProgressEvent);
      message.success(t("branch.createSuccess", { name: values.name }));
      await refreshProject();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.message || t("branch.createFailed"));
    } finally {
      setCreateLoading(false);
    }
  }, [projectId, createForm, refreshProject, appendBranchProgressEvent, startBranchProgress, t]);

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
      startBranchProgress("MERGE");
      await mergeBranch(
        projectId,
        {
          sourceBranch: values.sourceBranch,
          targetBranch: values.targetBranch,
          conflictStrategy: values.conflictStrategy as ConflictStrategy,
        },
        appendBranchProgressEvent,
      );
      message.success(t("branch.mergeSuccess"));
      await refreshProject();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || t("branch.mergeFailed"));
    } finally {
      setMergeLoading(false);
    }
  }, [projectId, mergeForm, refreshProject, appendBranchProgressEvent, startBranchProgress, t]);

  const activeBranchProgress = branchProgress?.operation ?? null;
  const progressEvents = branchProgress?.events ?? [];
  const latestProgressEvent = progressEvents[progressEvents.length - 1];
  const branchProgressPercent = latestProgressEvent?.progress ?? 0;
  const branchProgressHasFailure = progressEvents.some(
    (event) => event.type === "FAILED" || event.type === "MODEL_FAILED",
  );
  const branchProgressCompleted = latestProgressEvent?.type === "COMPLETED";

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
        onClick: () => {
          clearBranchProgress();
          setCreateModalOpen(true);
        },
      },
      {
        key: '__merge__',
        label: t('branch.mergeBranch'),
        icon: <MergeCellsOutlined />,
        onClick: () => {
          clearBranchProgress();
          setMergeModalOpen(true);
        },
      },
      {
        key: '__manage__',
        label: t('branch.manageBranches'),
        icon: <SettingOutlined />,
        onClick: () => setManageModalOpen(true),
      },
    ];
  }, [branches, currentBranch, handleSwitch, clearBranchProgress, t, token]);

  useEffect(() => {
    onMenuItemsChange?.(breadcrumbMenuItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length, currentBranch, t]);

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
          clearBranchProgress();
        }}
        confirmLoading={createLoading}
        destroyOnHidden
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
          {activeBranchProgress === "CREATE" && (
            <BranchProgressPanel
              events={progressEvents}
              title={t("branch.progressCreate")}
              percent={branchProgressPercent}
              failure={branchProgressHasFailure}
              completed={branchProgressCompleted}
            />
          )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginXS }}>
            {branches.map((item) => {
              const isCurrent = item.name === currentBranch;
              const canDelete = item.name !== "main" && !isCurrent;
              return (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${token.paddingSM}px ${token.paddingSM}px`,
                    borderRadius: token.borderRadius,
                    backgroundColor: token.colorFillQuaternary,
                  }}
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
                  {canDelete && (
                    <Popconfirm
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
                    </Popconfirm>
                  )}
                </div>
              );
            })}
          </div>
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
          clearBranchProgress();
        }}
        confirmLoading={mergeLoading}
        destroyOnHidden
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
          {activeBranchProgress === "MERGE" && (
            <BranchProgressPanel
              events={progressEvents}
              title={t("branch.progressMerge")}
              percent={branchProgressPercent}
              failure={branchProgressHasFailure}
              completed={branchProgressCompleted}
            />
          )}
        </Form>
      </Modal>
    </>
  );
};

export default BranchSwitcher;
