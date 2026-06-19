import React, {useCallback, useEffect, useState} from "react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tabs,
  theme,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import FunctionInvokePanel from "./components/FunctionInvokePanel";
import type {
  FunctionDeployRequest,
  FunctionResponse,
  FunctionTemplate,
} from "@/services/function";
import {
  deployFunction,
  getFunction,
  getFunctionTemplates,
} from "@/services/function";

const {Text, Title} = Typography;

const DEFAULT_INDEX_CODE = `export default async function(input, ctx) {
  const data = await ctx.flexmodel.data.find("Example");
  return ctx.json({ hello: "world", total: data.total });
}`;

interface FileEntry {
  filename: string;
  content: string;
}

const FunctionEditor: React.FC = () => {
  const {t} = useTranslation();
  const {token} = theme.useToken();
  const navigate = useNavigate();
  const {projectId, name: fnName} = useParams<{ projectId: string; name?: string }>();
  const isEdit = !!fnName;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([
    {filename: "index.ts", content: DEFAULT_INDEX_CODE},
  ]);
  const [activeFile, setActiveFile] = useState("index.ts");
  const [templates, setTemplates] = useState<FunctionTemplate[]>([]);
  const [templateDrawerVisible, setTemplateDrawerVisible] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [fnData, setFnData] = useState<FunctionResponse | null>(null);

  // Load existing function data
  useEffect(() => {
    if (isEdit && fnName && projectId) {
      setLoading(true);
      getFunction(projectId, fnName)
        .then((fn) => {
          setFnData(fn);
          form.setFieldsValue({name: fn.name});
          if (fn.sourceFiles) {
            const entries: FileEntry[] = Object.entries(fn.sourceFiles).map(([k, v]) => ({
              filename: k,
              content: v as string,
            }));
            if (entries.length > 0) {
              setFiles(entries);
              setActiveFile(entries[0].filename);
            }
          }
        })
        .catch(() => {
          message.error(t("function.loadFailed"));
          navigate(`/project/${projectId}/functions`);
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, fnName, projectId, form, navigate, t]);

  // Load templates
  useEffect(() => {
    getFunctionTemplates()
      .then(setTemplates)
      .catch(() => {/* silent */});
  }, []);

  // ---- File management ----
  const handleAddFile = useCallback(() => {
    let name = "utils.ts";
    let i = 1;
    while (files.some((f) => f.filename === name)) {
      name = `utils${i}.ts`;
      i++;
    }
    const newFiles = [...files, {filename: name, content: "// Add your code here"}];
    setFiles(newFiles);
    setActiveFile(name);
    setRenamingFile(name);
    setRenameValue(name);
  }, [files]);

  const handleRemoveFile = useCallback((filename: string) => {
    if (filename === "index.ts") return;
    setFiles((prev) => prev.filter((f) => f.filename !== filename));
    setActiveFile((prev) => (prev === filename ? "index.ts" : prev));
  }, []);

  const handleFileContentChange = useCallback((content: string | undefined) => {
    setFiles((prev) =>
      prev.map((f) => (f.filename === activeFile ? {...f, content: content || ""} : f))
    );
  }, [activeFile]);

  const startRename = useCallback((filename: string) => {
    if (filename === "index.ts") return;
    setRenamingFile(filename);
    setRenameValue(filename);
  }, []);

  const confirmRename = useCallback((oldName: string) => {
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      setRenamingFile(null);
      return;
    }
    if (!newName.endsWith(".ts") && !newName.endsWith(".js")) {
      message.warning(t("function.fileNameFormat"));
      return;
    }
    if (files.some((f) => f.filename === newName)) {
      message.warning(t("function.fileNameExists"));
      return;
    }
    setFiles((prev) =>
      prev.map((f) => (f.filename === oldName ? {...f, filename: newName} : f))
    );
    if (activeFile === oldName) setActiveFile(newName);
    setRenamingFile(null);
  }, [renameValue, files, activeFile, t]);

  // ---- Template ----
  const handleApplyTemplate = useCallback((tpl: FunctionTemplate) => {
    const entries: FileEntry[] = Object.entries(tpl.sourceFiles).map(([k, v]) => ({
      filename: k,
      content: v as string,
    }));
    if (entries.length > 0) {
      setFiles(entries);
      setActiveFile(entries[0].filename);
    }
    setTemplateDrawerVisible(false);
    message.success(t("function.templateApplied"));
  }, [t]);

  // ---- Submit (deploy / upsert) ----
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sourceFiles: Record<string, string> = {};
      for (const f of files) {
        sourceFiles[f.filename] = f.content;
      }
      setSubmitting(true);

      const functionName = fnName || values.name;

      const data: FunctionDeployRequest = {
        name: values.name,
        sourceFiles,
        timeout: 30,
      };

      await deployFunction(projectId!, functionName, data);
      message.success(t("function.deploySuccess"));
      navigate(`/project/${projectId}/functions`);
    } catch (err: any) {
      if (err?.errorFields) {
        return;
      }
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        t("function.deployFailed");
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeFileContent = files.find((f) => f.filename === activeFile)?.content || "";

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        flex: 1, height: "100%", background: token.colorBgLayout,
      }}>
        <Spin size="large"/>
      </div>
    );
  }

  // ---- Sidebar (file tree) ----
  const fileTreeSidebar = (
    <div style={{
      width: 220, minWidth: 220, height: "100%",
      display: "flex", flexDirection: "column",
      borderRight: `1px solid ${token.colorBorderSecondary}`,
      background: token.colorBgContainer,
    }}>
      <div style={{
        padding: `${token.paddingSM}px ${token.padding}px`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}>
        <Text strong style={{fontSize: 14, fontWeight: 500, letterSpacing: 0.16, textTransform: "uppercase"}}>
          {t("function.files")}
        </Text>
        <Tooltip title={t("function.addFile")}>
          <Button type="text" size="small" icon={<FileAddOutlined/>} onClick={handleAddFile}/>
        </Tooltip>
      </div>
      <div style={{flex: 1, overflowY: "auto", padding: `${token.paddingXS}px 0`}}>
        {files.map((f) => (
          <div
            key={f.filename}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: `4px ${token.padding}px`,
              cursor: "pointer", fontSize: 14,
              background: activeFile === f.filename ? token.colorPrimaryBg : "transparent",
              color: activeFile === f.filename ? token.colorPrimary : token.colorText,
              borderLeft: activeFile === f.filename
                ? `2px solid ${token.colorPrimary}` : "2px solid transparent",
            }}
            onClick={() => {
              if (renamingFile !== f.filename) setActiveFile(f.filename);
            }}
          >
            <FileTextOutlined style={{fontSize: 12, flexShrink: 0}}/>
            {renamingFile === f.filename ? (
              <Input
                size="small"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onPressEnter={() => confirmRename(f.filename)}
                onBlur={() => confirmRename(f.filename)}
                style={{flex: 1, fontSize: 12, padding: "0 4px"}}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <span style={{flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                  {f.filename}
                </span>
                <Dropdown
                  menu={{
                    items: [
                      ...(f.filename !== "index.ts" ? [
                        {key: "rename", icon: <EditOutlined/>, label: t("function.renameFile")},
                        {key: "delete", icon: <DeleteOutlined/>, label: t("delete"), danger: true},
                      ] : []),
                    ],
                    onClick: ({key, domEvent}) => {
                      domEvent.stopPropagation();
                      if (key === "rename") startRename(f.filename);
                      else if (key === "delete") handleRemoveFile(f.filename);
                    },
                  }}
                  trigger={["click"]}
                >
                  <Button
                    type="text" size="small"
                    icon={<MoreOutlined style={{fontSize: 12}}/>}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      opacity: activeFile === f.filename ? 1 : 0,
                      transition: "opacity 0.2s", flexShrink: 0,
                    }}
                  />
                </Dropdown>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ---- Editor area ----
  const editorArea = (
    <div style={{flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden"}}>
      {/* Inject CSS to make Ant Design Tabs internal elements stretch via flex */}
      <style>{`
        .fn-editor-tabs .ant-tabs-content-holder {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .fn-editor-tabs .ant-tabs-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .fn-editor-tabs .ant-tabs-tabpane-active {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
      `}</style>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        className="fn-editor-tabs"
        style={{flex: 1, display: "flex", flexDirection: "column", minHeight: 0}}
        tabBarStyle={{margin: 0, padding: `0 ${token.padding}px`, flexShrink: 0}}
        items={[
          {
            key: "code",
            label: <span><CodeOutlined/> {t("function.tabCode")}</span>,
            children: (
              <div style={{flex: 1, overflow: "hidden"}}>
                <ScriptEditor
                  language="javascript"
                  height="100%"
                  value={activeFileContent}
                  onChange={handleFileContentChange}
                  style={{height: "100%", border: "none", borderRadius: 0}}
                />
              </div>
            ),
          },
          ...(isEdit ? [{
            key: "test",
            label: <span><PlayCircleOutlined/> {t("function.tabTest")}</span>,
            children: (
              <div style={{padding: token.padding, overflowY: "auto", flex: 1}}>
                <FunctionInvokePanel projectId={projectId!} functionName={fnName!}/>
              </div>
            ),
          }] : []),
        ]}
      />
    </div>
  );

  return (
    <div style={{
      flex: 1, height: "100%", minHeight: 0,
      display: "flex", flexDirection: "column",
      background: token.colorBgLayout, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        height: token.controlHeight * 1.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${token.paddingLG}px`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        flexShrink: 0,
      }}>
        <Space>
          <Button
            type="text" icon={<ArrowLeftOutlined/>}
            onClick={() => navigate(`/project/${projectId}/functions`)}
          />
          <Title level={4} style={{margin: 0}}>
            {isEdit ? fnData?.name || fnName : t("function.createNew")}
          </Title>
        </Space>
        <Space>
          <Button
            icon={<CodeOutlined/>}
            onClick={() => setTemplateDrawerVisible(true)}
          >
            {t("function.templates")}
          </Button>
        </Space>
      </div>

      {/* Main area: sidebar + editor */}
      <div style={{flex: 1, display: "flex", overflow: "hidden"}}>
        {fileTreeSidebar}
        {editorArea}
      </div>

      {/* Bottom bar: settings + deploy */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `${token.paddingSM}px ${token.paddingLG}px`,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        flexShrink: 0,
        gap: token.margin,
      }}>
        <Form form={form} layout="inline" style={{flex: 1}}>
          <Form.Item
            name="name"
            label={t("function.name")}
            rules={[{required: true, message: t("function.nameRequired")}, {max: 100}]}
            style={{flex: 1, maxWidth: 320}}
          >
            <Input placeholder="my-function" disabled={isEdit} size="small"/>
          </Form.Item>
        </Form>
        <Button
          type="primary"
          icon={<CheckOutlined/>}
          loading={submitting}
          onClick={handleSubmit}
        >
          {t("function.deploy")}
        </Button>
      </div>

      <Modal
        title={t("function.templates")}
        open={templateDrawerVisible}
        onCancel={() => setTemplateDrawerVisible(false)}
        footer={null}
        width={520}
      >
        <div style={{maxHeight: 400, overflowY: "auto"}}>
          {templates.length === 0 ? (
            <div style={{textAlign: "center", padding: 32, color: token.colorTextSecondary}}>
              {t("function.noTemplates")}
            </div>
          ) : (
            templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  padding: `${token.paddingSM}px ${token.padding}px`,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  marginBottom: token.marginSM,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handleApplyTemplate(tpl)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = token.colorPrimary;
                  (e.currentTarget as HTMLElement).style.background = token.colorPrimaryBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = token.colorBorderSecondary;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Text strong>{tpl.name}</Text>
                <br/>
                <Text type="secondary" style={{fontSize: 12}}>{tpl.description}</Text>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FunctionEditor;
