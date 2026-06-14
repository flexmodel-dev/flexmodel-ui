import React, {useEffect, useState} from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  FileAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import type {
  FunctionResponse,
  FunctionCreateRequest,
  FunctionUpdateRequest,
  FunctionTemplate,
} from "@/services/function";
import {createFunction, updateFunction, getFunctionTemplates} from "@/services/function";

const {Text} = Typography;

const DEFAULT_INDEX_CODE = `export default async function(req, ctx) {
  const data = await ctx.flexmodel.data.find("Example");
  return ctx.json({ hello: "world", total: data.total });
}`;

interface FileEntry {
  filename: string;
  content: string;
}

interface FunctionFormProps {
  visible: boolean;
  editingFunction: FunctionResponse | null;
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const FunctionForm: React.FC<FunctionFormProps> = ({
  visible,
  editingFunction,
  projectId,
  onSuccess,
  onCancel,
}) => {
  const {t} = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([{filename: "index.ts", content: DEFAULT_INDEX_CODE}]);
  const [activeFile, setActiveFile] = useState("index.ts");
  const [templates, setTemplates] = useState<FunctionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  const isEdit = !!editingFunction;

  // Load templates
  useEffect(() => {
    if (visible && !isEdit) {
      getFunctionTemplates()
        .then(setTemplates)
        .catch(() => {/* silent */});
    }
  }, [visible, isEdit]);

  useEffect(() => {
    if (visible) {
      if (editingFunction) {
        form.setFieldsValue({
          name: editingFunction.name,
          slug: editingFunction.slug,
          description: editingFunction.description,
          timeout: editingFunction.timeout,
        });
        // Parse source files
        if (editingFunction.sourceFiles) {
          try {
            const parsed = JSON.parse(editingFunction.sourceFiles);
            const entries: FileEntry[] = Object.entries(parsed).map(([k, v]) => ({
              filename: k,
              content: v as string,
            }));
            if (entries.length > 0) {
              setFiles(entries);
              setActiveFile(entries[0].filename);
            }
          } catch {
            setFiles([{filename: "index.ts", content: ""}]);
          }
        }
      } else {
        form.resetFields();
        form.setFieldsValue({timeout: 30});
        setFiles([{filename: "index.ts", content: DEFAULT_INDEX_CODE}]);
        setActiveFile("index.ts");
        setSelectedTemplate(undefined);
      }
    }
  }, [visible, editingFunction, form]);

  // Apply template
  const handleTemplateSelect = (slug: string) => {
    setSelectedTemplate(slug);
    const tpl = templates.find((t) => t.slug === slug);
    if (tpl) {
      try {
        const parsed = JSON.parse(tpl.sourceFiles);
        const entries: FileEntry[] = Object.entries(parsed).map(([k, v]) => ({
          filename: k,
          content: v as string,
        }));
        setFiles(entries);
        setActiveFile(entries[0]?.filename || "index.ts");
      } catch {
        // ignore
      }
    }
  };

  // File management
  const handleAddFile = () => {
    let name = "utils.ts";
    let i = 1;
    while (files.some((f) => f.filename === name)) {
      name = `utils${i}.ts`;
      i++;
    }
    setFiles([...files, {filename: name, content: "// Add your code here"}]);
    setActiveFile(name);
  };

  const handleRemoveFile = (filename: string) => {
    if (filename === "index.ts") return; // cannot remove main entry
    setFiles(files.filter((f) => f.filename !== filename));
    if (activeFile === filename) {
      setActiveFile("index.ts");
    }
  };

  const handleFileContentChange = (content: string | undefined) => {
    setFiles(files.map((f) =>
      f.filename === activeFile ? {...f, content: content || ""} : f
    ));
  };

  const handleRenameFile = (oldName: string, newName: string) => {
    if (oldName === "index.ts") return; // cannot rename main entry
    if (!newName.endsWith(".ts") && !newName.endsWith(".js")) {
      message.warning(t("function.fileNameFormat") || "File name must end with .ts or .js");
      return;
    }
    if (files.some((f) => f.filename === newName)) {
      message.warning(t("function.fileNameExists") || "File name already exists");
      return;
    }
    setFiles(files.map((f) =>
      f.filename === oldName ? {...f, filename: newName} : f
    ));
    if (activeFile === oldName) setActiveFile(newName);
  };

  const activeFileContent = files.find((f) => f.filename === activeFile)?.content || "";

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build sourceFiles map
      const sourceFiles: Record<string, string> = {};
      for (const f of files) {
        sourceFiles[f.filename] = f.content;
      }

      setSubmitting(true);

      if (isEdit) {
        const data: FunctionUpdateRequest = {
          description: values.description,
          sourceFiles,
          timeout: values.timeout,
        };
        await updateFunction(projectId, editingFunction!.slug, data);
        message.success(t("function.updateSuccess"));
      } else {
        const data: FunctionCreateRequest = {
          name: values.name,
          slug: values.slug,
          description: values.description,
          sourceFiles,
          timeout: values.timeout || 30,
        };
        await createFunction(projectId, data);
        message.success(t("function.createSuccess"));
      }

      onSuccess();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      const errorMsg = err?.response?.data?.message || err?.message ||
        (isEdit ? t("function.updateFailed") : t("function.createFailed"));
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const fileTabs = (
    <div style={{display: "flex", alignItems: "center", gap: 4, marginBottom: 4, flexWrap: "wrap"}}>
      {files.map((f) => (
        <Tag
          key={f.filename}
          color={activeFile === f.filename ? "blue" : "default"}
          style={{cursor: "pointer", marginBottom: 4}}
          closable={f.filename !== "index.ts"}
          onClose={() => handleRemoveFile(f.filename)}
          onClick={() => setActiveFile(f.filename)}
        >
          {f.filename}
        </Tag>
      ))}
      <Button
        type="dashed"
        size="small"
        icon={<FileAddOutlined/>}
        onClick={handleAddFile}
        style={{marginBottom: 4}}
      >
        {t("function.addFile")}
      </Button>
    </div>
  );

  return (
    <Modal
      title={isEdit ? t("function.edit") : t("function.create")}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={900}
      destroyOnClose
      okText={t("function.deploy")}
      cancelText={t("cancel")}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Tabs
          items={[
            {
              key: "settings",
              label: t("function.tabSettings"),
              children: (
                <div style={{paddingTop: 8}}>
                  <Form.Item
                    name="name"
                    label={t("function.name")}
                    rules={[
                      {required: true, message: t("function.nameRequired")},
                      {max: 100},
                    ]}
                  >
                    <Input placeholder="my-function" disabled={isEdit}/>
                  </Form.Item>

                  <Form.Item
                    name="slug"
                    label={t("function.slug")}
                    rules={[
                      {required: true, message: t("function.slugRequired")},
                      {pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: t("function.slugFormat")},
                      {max: 100},
                    ]}
                  >
                    <Input placeholder="my-function" disabled={isEdit}/>
                  </Form.Item>

                  <Form.Item name="description" label={t("description")} rules={[{max: 500}]}>
                    <Input.TextArea placeholder={t("function.descriptionPlaceholder")} rows={2}/>
                  </Form.Item>

                  <Form.Item
                    name="timeout"
                    label={t("function.timeout")}
                    rules={[{required: true}]}
                  >
                    <InputNumber min={5} max={300} style={{width: "100%"}} addonAfter="s"/>
                  </Form.Item>

                  {!isEdit && templates.length > 0 && (
                    <Form.Item label={t("function.template")}>
                      <Select
                        placeholder={t("function.selectTemplate")}
                        value={selectedTemplate}
                        onChange={handleTemplateSelect}
                        allowClear
                      >
                        {templates.map((tpl) => (
                          <Select.Option key={tpl.slug} value={tpl.slug}>
                            <div>
                              <Text strong>{tpl.name}</Text>
                              <br/>
                              <Text type="secondary" style={{fontSize: 12}}>{tpl.description}</Text>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </div>
              ),
            },
            {
              key: "code",
              label: t("function.tabCode"),
              children: (
                <div style={{paddingTop: 8}}>
                  {fileTabs}
                  <ScriptEditor
                    language="typescript"
                    height={380}
                    value={activeFileContent}
                    onChange={handleFileContentChange}
                  />
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default FunctionForm;
