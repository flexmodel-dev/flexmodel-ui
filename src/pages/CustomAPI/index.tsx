import React, {useEffect, useRef, useState, useCallback} from "react";
import {Button, Form, Input, message, Modal, Select, Splitter, Tabs, TabsProps, Typography,} from "antd";
import PageContainer from "@/components/common/PageContainer";
import {
  createApi,
  deleteApi,
  getApiHistories,
  getApis,
  restoreApiHistory,
  updateApi,
  updateApiName,
  updateApiStatus,
} from "@/services/api-info.ts";
import DetailPanel from "./components/DetailPanel.tsx";
import {useTranslation} from "react-i18next";
import {ApiDefinition, ApiDefinitionHistory, ApiMeta, GraphQLData, TreeNode} from "@/types/api-management";
import BatchCreateDrawer from "./components/BatchCreateDrawer.tsx";
import {useAppStore, useConfig, useProject} from "@/store/appStore.ts";
import DebugPanel from "./components/DebugPanel";
import EditPanel from "./components/EditPanel/index.tsx";
import APIExplorer from "./components/APIExplorer";
import {HistoryOutlined} from "@ant-design/icons";
import HistoryModal, {HistoryRecord} from "./components/HistoryModal";

const methodOptions = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "PATCH", label: "PATCH" },
  { value: "DELETE", label: "DELETE" },
];

const CustomAPI: React.FC = () => {
  const { t } = useTranslation();
  const { config } = useConfig();
  const {currentTenant} = useAppStore();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';
  // 状态定义
  const [apiList, setApiList] = useState<ApiDefinition[]>([]);
  const [batchCreateDialogDrawer, setBatchCreateDrawerVisible] =
    useState<boolean>(false);

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Helper function to find a node by ID in the API list
  const findNodeById = useCallback((list: ApiDefinition[], id: string): TreeNode | null => {
    for (const item of list) {
      if (item.id === id) {
        return {
          children: [],
          data: item,
          isLeaf: item.type === "API",
          key: item.id,
          settingVisible: false,
          title: item.name,
        };
      }
      if (item.children?.length) {
        const found = findNodeById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper function to find the first API node in the list
  const findFirstApiNode = useCallback((list: ApiDefinition[]): ApiDefinition | null => {
    for (const api of list) {
      if (api.type === "API") {
        return api;
      }
      if (api.children) {
        const result = findFirstApiNode(api.children);
        if (result) return result;
      }
    }
    return null;
  }, []);

  // Initialize selectedNode
  useEffect(() => {
    if (apiList.length > 0 && !selectedNode) {
      const defaultApi = findFirstApiNode(apiList);
      if (defaultApi) {
        setSelectedNode({
          children: [],
          data: defaultApi,
          isLeaf: true,
          key: defaultApi.id,
          settingVisible: false,
          title: defaultApi.name,
        });
      }
    }
  }, [apiList, selectedNode, findFirstApiNode, setSelectedNode]);

  const [editForm, setEditForm] = useState<ApiDefinition | null>(null);
  const [activeHeaderTab, setActiveHeaderTab] = useState<string>('detail');

  const handleTabChange = useCallback((key: string) => {
    setActiveHeaderTab(key);
  }, []);
  const [debugMethod, setDebugMethod] = useState<string>("GET");
  const [debugPath, setDebugPath] = useState<string>("");
  const [debugHeaders, setDebugHeaders] = useState<string>("{}");
  const [debugBody, setDebugBody] = useState<string>("");
  const [debugResponse, setDebugResponse] = useState<string>("");
  const [debugResponseStatus, setDebugResponseStatus] = useState<string>("");
  const [debugLoading, setDebugLoading] = useState<boolean>(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTarget, setRenameTarget] = useState<any>(null);

  const [createParentId, setCreateParentId] = useState<string | null>(null);
  // 新建接口弹窗逻辑
  const [createApiDialogVisible, setCreateApiDialogVisible] = useState(false);
  // 新建文件夹弹窗逻辑
  const [createFolderDialogVisible, setCreateFolderDialogVisible] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createApiPath, setCreateApiPath] = useState("/");
  const [createApiMethod, setCreateApiMethod] = useState("GET");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (selectedNode?.data) {
      // 确保graphql字段存在，如果不存在则初始化为空对象
      let graphqlData: GraphQLData = selectedNode.data.graphql || {
        operationName: "MyQuery",
        query: "",
        variables: null,
        headers: null,
      };

      // 如果选中的是API类型且有meta.execution数据，则使用meta.execution的内容
      if (
        selectedNode.data.type === "API" &&
        selectedNode.data.meta?.execution
      ) {
        const execution = selectedNode.data.meta.execution;
        graphqlData = {
          operationName: execution.operationName || "MyQuery",
          query: execution.query || "",
          variables: execution.variables || null,
          headers: execution.headers || null,
        };
      }

      const data: ApiDefinition = {
        id: selectedNode.data.id || "",
        name: selectedNode.data.name || "",
        parentId: selectedNode.data.parentId || null,
        type: selectedNode.data.type || "",
        method: selectedNode.data.method || "",
        path: selectedNode.data.path || "",
        children: selectedNode.data.children || [],
        data: selectedNode.data.data || {},
        meta: selectedNode.data.meta || {},
        enabled: selectedNode.data.enabled ?? true,
        createdBy: selectedNode.data.createdBy || "",
        updatedBy: selectedNode.data.updatedBy || "",
        createdAt: selectedNode.data.createdAt || "",
        updatedAt: selectedNode.data.updatedAt || "",
        graphql: graphqlData,
      };
      setEditForm(data);
      executionDataRef.current = data.meta?.execution || undefined;
      setDebugMethod(data.method || "GET");
      setDebugPath(data.path || "");
      setDebugBody("");
      setDebugHeaders("{}");
      setDebugResponse("");
      setDebugResponseStatus("");
    }
  }, [selectedNode]);

  // 移除空的useEffect，避免不必要的渲染

  // 请求 API 列表数据
  useEffect(() => {
    reqApiList().then((apis) => {
      // Set default selection
      const defaultApi = findFirstApiNode(apis);
      if (defaultApi) {
        setSelectedNode({
          children: [],
          data: defaultApi,
          isLeaf: true,
          key: defaultApi.id,
          settingVisible: false,
          title: defaultApi.name,
        });
      }
    });
  }, [setSelectedNode, findFirstApiNode]);

  const reqApiList = async () => {
    const apis = await getApis(projectId);
    setApiList(apis);
    return apis;
  };

  const showDeleteConfirm = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      setDeleteLoading(true);
      try {
        await deleteApi(projectId, deleteTarget.id);
        message.success(t("delete_success"));
        reqApiList();
        setDeleteConfirmVisible(false);
      } catch {
        message.error(t("delete_failed"));
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const showEditInput = (data: ApiDefinition) => {
    setRenameTarget(data);
    setRenameValue(data.name);
    setRenameDialogVisible(true);
  };

  const renameApi = async (name: string) => {
    if (renameTarget) {
      await updateApiName(projectId, renameTarget.id, name);
      message.success(t("rename_success"));
      reqApiList();
    }
  };

  const showCreateApiDialog = (parentId?: string | null) => {
    setCreateParentId(parentId || null);
    setCreateName("");
    setCreateApiPath("/");
    setCreateApiMethod("GET");
    setCreateError("");
    setCreateApiDialogVisible(true);
  };

  const addFolder = async (parentId?: string | null) => {
    if (!createName.trim()) {
      setCreateError(t("folder_name_required"));
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      await createApi(projectId, {
        name: createName,
        parentId: parentId,
        type: "FOLDER",
      });
      message.success(t("create_success"));
      setCreateFolderDialogVisible(false);
      setCreateName("");
      setCreateApiPath("/");
      setCreateApiMethod("GET");
      reqApiList();
    } catch (error: any) {
      setCreateError(error.message || t("create_failed"));
    } finally {
      setCreateLoading(false);
    }
  };

  const addApi = async (parentId?: string | null) => {
    if (!createName.trim()) {
      setCreateError(t("api_name_required"));
      return;
    }
    if (!createApiPath.trim()) {
      setCreateError(t("api_path_required"));
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      const normalizedPath = createApiPath.trim().startsWith("/")
        ? createApiPath.trim()
        : `/${createApiPath.trim()}`;
      await createApi(projectId, {
        name: createName.trim(),
        parentId: parentId,
        type: "API",
        method: createApiMethod,
        path: normalizedPath,
        enabled: false,
        meta: {},
      });
      message.success(t("create_success"));
      setCreateApiDialogVisible(false);
      setCreateName("");
      setCreateApiPath("/");
      setCreateApiMethod("GET");
      reqApiList();
    } catch (error: any) {
      setCreateError(error.message || t("create_failed"));
    } finally {
      setCreateLoading(false);
    }
  };

  const showCreateFolderDialog = (parentId?: string | null) => {
    setCreateParentId(parentId || null);
    setCreateFolderDialogVisible(true);
    setCreateName("");
    setCreateApiPath("/");
    setCreateApiMethod("GET");
    setCreateError("");
  };

  const handleCreateFolder = async () => {
    await addFolder(createParentId);
  };

  const handleCreateApi = async () => {
    await addApi(createParentId);
  };

  // 根据ID获取上级目录名称
  const getParentFolderName = (parentId: string | null): string => {
    if (!parentId) return t("root_directory");

    const findFolder = (
      apis: ApiDefinition[],
      targetId: string
    ): ApiDefinition | null => {
      for (const api of apis) {
        if (api.id === targetId) {
          return api;
        }
        if (api.children) {
          const found = findFolder(api.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findFolder(apiList, parentId);
    return parent ? parent.name : t("unknown_directory");
  };

  const executionDataRef = useRef<any>({});

  const handleSaveApi = async () => {
    if (editForm) {
      // 构造保存数据，确保包含parentId
      const executionData =
        executionDataRef.current ?? editForm.meta?.execution;

      const saveData = {
        name: editForm.name,
        method: editForm.method,
        path: editForm.path || "",
        parentId: editForm.parentId,
        enabled: editForm.enabled,
        type: editForm.type,
        meta: { ...editForm.meta, execution: executionData },
        graphql: editForm.graphql,
        createdBy: editForm.createdBy,
        updatedBy: editForm.updatedBy,
        createdAt: editForm.createdAt,
        updatedAt: editForm.updatedAt,
      };

      await updateApi(projectId, editForm.id, saveData);
      message.success(t("form_save_success"));
      reqApiList();
    }
  };

  const headerTabItems: TabsProps["items"] = [
    {
      key: "detail",
      label: t("apis.detail"),
    },
    {
      key: "edit",
      label: t("apis.edit"),
    },
    {
      key: "debug",
      label: t("apis.debug"),
    },
  ];

  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  const mapToHistoryRecord = (h: ApiDefinitionHistory): HistoryRecord => {
    return {
      id: h.id,
      title: t("apis.version", { version: h.updatedAt || h.createdAt }),
      operator: h.updatedBy || h.createdBy || t("apis.unknown_operator"),
      time: h.updatedAt || h.createdAt,
      detail: `${h.method || ""} ${h.path || ""}`.trim(),
      payload: h as any,
    };
  };

  const handleHistoryClick = async () => {
    if (!editForm?.id) {
      message.warning(t("apis.select_api"));
      return;
    }
    setHistoryVisible(true);
    try {
      const list = await getApiHistories(projectId, editForm.id);
      const mapped = (list || [])
        .map(mapToHistoryRecord)
        .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
      setHistoryRecords(mapped);
    } catch {
      message.error(t("apis.get_history_failed"));
      setHistoryRecords([]);
    }
  };

  const renderMainContent = () => {
    if (activeHeaderTab === "detail") {
      return (
        <div className="flex-1 overflow-auto">
          <DetailPanel data={editForm || undefined} />
        </div>
      );
    }

    if (activeHeaderTab === "edit") {
      return (
        <EditPanel
          editForm={editForm}
          methodOptions={methodOptions}
          apiRootPath={config?.apiRootPath}
          saveLabel={t("save")}
          executeConfigLabel={t("apis.execution_config")}
          authorizationLabel={t("authorization")}
          documentLabel={t("apis.document.title", { defaultValue: "数据映射" })}
          onSave={handleSaveApi}
          onMethodChange={(value) =>
            setEditForm((prev) => (prev ? { ...prev, method: value } : prev))
          }
          onPathChange={(value) =>
            setEditForm((prev) => (prev ? { ...prev, path: value } : prev))
          }
          onToggleEnabled={(val) => {
            if (editForm) {
              setEditForm({ ...editForm, enabled: val });
              updateApiStatus(projectId, editForm.id, val).then(() => {
                message.success(val ? t("enabled") : t("closed"));
                reqApiList();
              });
            }
          }}
          onExecutionChange={(data) => {
            executionDataRef.current = data.execution;
          }}
          onAuthorizationChange={(data) => {
            if (data?.execution !== undefined) {
              executionDataRef.current = data.execution;
            }
            setEditForm((prev) =>
              prev
                ? {
                  ...prev,
                  meta: data as ApiMeta,
                }
                : prev
            );
          }}
          ondocumentChange={(data) => {
            if (data?.execution !== undefined) {
              executionDataRef.current = data.execution;
            }
            setEditForm((prev) =>
              prev
                ? {
                  ...prev,
                  meta: data as ApiMeta,
                }
                : prev
            );
          }}
        />
      );
    }

    return (
      <DebugPanel
        method={debugMethod}
        path={debugPath}
        headers={debugHeaders}
        body={debugBody}
        response={debugResponse}
        responseStatus={debugResponseStatus}
        loading={debugLoading}
        methodOptions={methodOptions}
        apiRootPath={config?.apiRootPath}
        onMethodChange={setDebugMethod}
        onPathChange={setDebugPath}
        onHeadersChange={setDebugHeaders}
        onBodyChange={setDebugBody}
        onSend={handleSendDebugRequest}
      />
    );
  };

  const handleSendDebugRequest = async () => {
    if (!editForm) return;

    let parsedHeaders: Record<string, string> = {};
    if (debugHeaders.trim()) {
      try {
        parsedHeaders = JSON.parse(debugHeaders);
      } catch {
        message.error(t("apis.header_format_error"));
        return;
      }
    }

    const normalizedPath = debugPath.startsWith("/")
      ? debugPath
      : `/${debugPath}`;
    const tenantId = currentTenant?.id;
    const apiRootPathWithTenant = `${config?.apiRootPath || ''}/${tenantId}`;
    const url = `${apiRootPathWithTenant}${normalizedPath}`;

    setDebugLoading(true);
    setDebugResponse("");
    setDebugResponseStatus("");
    try {
      const response = await fetch(url, {
        method: debugMethod,
        headers: {
          "Content-Type": "application/json",
          ...parsedHeaders,
        },
        body:
          ["GET", "HEAD"].includes(debugMethod.toUpperCase()) ||
            !debugBody.trim()
            ? undefined
            : debugBody,
      });
      const text = await response.text();
      setDebugResponse(text);
      setDebugResponseStatus(`${response.status} ${response.statusText}`);
    } catch (error: any) {
      setDebugResponseStatus(t("apis.request_failed"));
      setDebugResponse(error?.message || String(error));
    } finally {
      setDebugLoading(false);
    }
  };

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // 还原历史版本
  const handleRestoreHistory = async (record: HistoryRecord) => {
    if (!editForm?.id) {
      message.warning(t("apis.select_api"));
      return;
    }
    try {
      await restoreApiHistory(projectId, editForm.id, record.id);
      message.success(t("apis.restore_success", { title: record.title }));
      // 刷新API列表并保持当前选中项不变
      const apis = await reqApiList();
      const findApiById = (list: ApiDefinition[], id: string): ApiDefinition | null => {
        for (const item of list) {
          if (item.id === id) return item;
          if (item.children?.length) {
            const found = findApiById(item.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      const updated = findApiById(apis, editForm.id);
      if (updated) {
        setSelectedNode({
          children: [],
          data: updated,
          isLeaf: true,
          key: updated.id,
          settingVisible: false,
          title: updated.name,
        });
      }
      // 重新加载历史记录列表
      try {
        const list = await getApiHistories(projectId, editForm.id);
        const mapped = (list || [])
          .map(mapToHistoryRecord)
          .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
        setHistoryRecords(mapped);
      } catch {
        // 忽略内部刷新失败
      }
    } catch (e: any) {
      message.error(e?.message || t("apis.restore_failed"));
    }
  };

  return (
    <PageContainer>
      <Splitter>
        <Splitter.Panel defaultSize="20%" max="40%" collapsible>
          <APIExplorer
            apiList={apiList}
            selectedApiId={selectedNode?.data.id}
            onSelectItem={(item: any) => {
              setSelectedNode({
                children: [],
                data: item.data,
                isLeaf: item.type === "file",
                key: item.path,
                settingVisible: false,
                title: item.filename,
              });
            }}
            onShowCreateApiDialog={showCreateApiDialog}
            onShowCreateFolderDialog={showCreateFolderDialog}
            onShowBatchCreate={() => setBatchCreateDrawerVisible(true)}
            onRename={showEditInput}
            onDelete={showDeleteConfirm}
          />
        </Splitter.Panel>
        <Splitter.Panel>
          {editForm?.type == "API" ? (
            <div className="flex flex-col h-full pl-2">
              <Tabs
                activeKey={activeHeaderTab}
                items={headerTabItems}
                onChange={handleTabChange}
                className="mb-2"
                tabBarExtraContent={
                  <Button
                    type="text"
                    shape="circle"
                    icon={<HistoryOutlined />}
                    onClick={handleHistoryClick}
                    aria-label="history"
                  />
                }
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {renderMainContent()}
              </div>
            </div>
          ) : (
            <div>
              <Typography.Text>
                {t("folder_name")}: {editForm?.name}
              </Typography.Text>
            </div>
          )}
        </Splitter.Panel>
      </Splitter>
      {/* 删除确认弹窗 */}
      <Modal
        title={t("delete")}
        open={deleteConfirmVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        confirmLoading={deleteLoading}
        okText={t("delete")}
        okButtonProps={{ danger: true }}
        cancelText={t("cancel")}
      >
        <span>
          {t("delete_dialog_text", { name: deleteTarget?.name || "" })}
        </span>
      </Modal>
      <HistoryModal
        open={historyVisible}
        onClose={() => setHistoryVisible(false)}
        records={historyRecords}
        onRestore={handleRestoreHistory}
        currentPayload={{ ...editForm as any, apiDefinitionId: editForm?.id }}
        ignoreFields={[
          "graphql",
          "children",
          "data",
          "updatedAt",
          "updatedAt",
          "updatedBy",
          "createdAt",
          "createdBy",
          "tenantId"
        ]}
      />
      {/* 新增重命名弹窗 */}
      <Modal
        title={t("rename")}
        open={renameDialogVisible}
        onCancel={() => setRenameDialogVisible(false)}
        onOk={async () => {
          await renameApi(renameValue);
          setRenameDialogVisible(false);
        }}
      >
        <Input
          value={renameValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRenameValue(e.target.value)
          }
        />
      </Modal>
      {/* 新建接口弹窗 */}
      <Modal
        title={t("new_api")}
        open={createApiDialogVisible}
        onCancel={() => setCreateApiDialogVisible(false)}
        onOk={handleCreateApi}
        confirmLoading={createLoading}
      >
        <Form layout="vertical">
          <Form.Item label={t("apis.parent_folder")}>
            <Input
              value={getParentFolderName(createParentId)}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>
          <Form.Item label={t("apis.name")}>
            <Input
              placeholder={t("apis.name")}
              value={createName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateName(e.target.value)
              }
              maxLength={32}
            />
          </Form.Item>
          <Form.Item label={t("apis.method")}>
            <Select
              value={createApiMethod}
              options={methodOptions}
              onChange={(value: string) => setCreateApiMethod(value)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label={t("apis.api_path")}>
            <Input
              placeholder={t("apis.api_path")}
              value={createApiPath}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCreateApiPath(e.target.value)
              }
            />
          </Form.Item>
        </Form>
        {createError && (
          <div style={{ color: "red", marginTop: 8 }}>{createError}</div>
        )}
      </Modal>
      {/* 新建文件夹弹窗 */}
      <Modal
        title={t("new_folder")}
        open={createFolderDialogVisible}
        onCancel={() => setCreateFolderDialogVisible(false)}
        onOk={handleCreateFolder}
        confirmLoading={createLoading}
      >
        <Form layout="vertical">
          <Form.Item label={t("apis.parent_folder")}>
            <Input
              value={getParentFolderName(createParentId)}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>
          <Form.Item label={t("folder_name")}>
            <Input
              placeholder={t("folder_name")}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              maxLength={32}
            />
          </Form.Item>
        </Form>
        {createError && (
          <div style={{ color: "red", marginTop: 8 }}>{createError}</div>
        )}
      </Modal>
      <BatchCreateDrawer
        onConfirm={(data: any) => {
          console.log(data);
          reqApiList();
          setBatchCreateDrawerVisible(false);
        }}
        onCancel={() => setBatchCreateDrawerVisible(false)}
        visible={batchCreateDialogDrawer}
      />
    </PageContainer>
  );
};

export default CustomAPI;
