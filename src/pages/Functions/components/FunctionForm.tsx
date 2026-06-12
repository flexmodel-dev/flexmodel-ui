import React, {useEffect, useState} from "react";
import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Tabs,
} from "antd";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import type {
  FunctionResponse,
  FunctionCreateRequest,
  FunctionUpdateRequest,
} from "@/services/function";
import {createFunction, updateFunction} from "@/services/function";

const DEFAULT_SOURCE_CODE = `// Deno.serve or export a default handler
export default async function(req, ctx) {
  const data = await ctx.flexmodel.data.find("Example");
  return ctx.json({ hello: "world", total: data.total });
}
`;

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
  const [enableTrigger, setEnableTrigger] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("basic");

  const isEdit = !!editingFunction;

  useEffect(() => {
    if (visible) {
      if (editingFunction) {
        form.setFieldsValue({
          name: editingFunction.name,
          slug: editingFunction.slug,
          description: editingFunction.description,
          entryPoint: editingFunction.entryPoint || "default",
          timeout: editingFunction.timeout,
          memoryLimit: editingFunction.memoryLimit,
          sourceCode: "", // source code must be provided on update
        });
        setEnableTrigger(
          !!(editingFunction.triggers && editingFunction.triggers.length > 0),
        );
        if (editingFunction.triggers && editingFunction.triggers.length > 0) {
          const trig = editingFunction.triggers[0];
          form.setFieldsValue({
            triggerPath: trig.path,
            triggerMethod: trig.method || "POST",
            authMode: trig.authMode || "PUBLIC",
          });
        }
      } else {
        form.resetFields();
        form.setFieldsValue({
          entryPoint: "default",
          timeout: 30,
          memoryLimit: 128,
          sourceCode: DEFAULT_SOURCE_CODE,
          triggerMethod: "POST",
          authMode: "PUBLIC",
        });
        setEnableTrigger(true);
      }
      setActiveTab("basic");
    }
  }, [visible, editingFunction, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (isEdit) {
        const data: FunctionUpdateRequest = {
          description: values.description,
          sourceCode: values.sourceCode,
          entryPoint: values.entryPoint,
          timeout: values.timeout,
          memoryLimit: values.memoryLimit,
        };
        await updateFunction(projectId, editingFunction!.slug, data);
        message.success(t("function.update_success"));
      } else {
        const data: FunctionCreateRequest = {
          name: values.name,
          slug: values.slug,
          description: values.description,
          sourceCode: values.sourceCode,
          entryPoint: values.entryPoint || "default",
          timeout: values.timeout || 30,
          memoryLimit: values.memoryLimit || 128,
        };
        if (enableTrigger) {
          data.triggerPath = values.triggerPath;
          data.triggerMethod = values.triggerMethod || "POST";
          data.authMode = values.authMode || "PUBLIC";
        }
        await createFunction(projectId, data);
        message.success(t("function.create_success"));
      }

      onSuccess();
    } catch (err: any) {
      // Distinguish between form validation errors and API/network errors
      if (err?.errorFields) {
        // Validation failed — Ant Design Form already shows inline error
        // messages under each field automatically, so no popup needed.
        return;
      }
      // API or network error — show a message to the user
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        (isEdit ? t("function.update_failed") : t("function.create_failed"));
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const basicTab = (
    <div style={{paddingTop: 8}}>
      <Form.Item
        name="name"
        label={t("function.name")}
        rules={[
          {required: true, message: t("function.name_required")},
          {max: 100, message: t("function.name_required")},
        ]}
      >
        <Input
          placeholder={t("function.name_placeholder")}
          disabled={isEdit}
        />
      </Form.Item>

      <Form.Item
        name="slug"
        label={t("function.slug")}
        rules={[
          {required: true, message: t("function.slug_required")},
          {
            pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            message: t("function.slug_format"),
          },
          {max: 100, message: t("function.slug_required")},
        ]}
      >
        <Input
          placeholder={t("function.slug_placeholder")}
          disabled={isEdit}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={t("description")}
        rules={[{max: 500}]}
      >
        <Input.TextArea
          placeholder={t("function.description_placeholder")}
          rows={2}
        />
      </Form.Item>

      <Form.Item
        name="entryPoint"
        label={t("function.entry_point")}
        rules={[
          {required: true, message: t("function.entry_point_required")},
          {max: 50},
        ]}
      >
        <Input placeholder="default" />
      </Form.Item>

      <Form.Item
        name="timeout"
        label={t("function.timeout")}
        rules={[{required: true, message: t("function.timeout_required")}]}
      >
        <InputNumber
          min={5}
          max={300}
          style={{width: "100%"}}
          addonAfter={t("function.seconds")}
        />
      </Form.Item>

      <Form.Item
        name="memoryLimit"
        label={t("function.memory_limit")}
        rules={[{required: true, message: t("function.memory_limit_required")}]}
      >
        <InputNumber
          min={64}
          max={1024}
          style={{width: "100%"}}
          addonAfter="MB"
        />
      </Form.Item>
    </div>
  );

  const triggerTab = (
    <div style={{paddingTop: 8}}>
      <Form.Item label={t("function.enable_http_trigger")}>
        <Switch checked={enableTrigger} onChange={setEnableTrigger} />
      </Form.Item>

      {enableTrigger && (
        <>
          <Form.Item
            name="triggerPath"
            label={t("function.trigger_path")}
            rules={[
              {required: true, message: t("function.trigger_path_required")},
              {max: 200},
            ]}
          >
            <Input placeholder={t("function.trigger_path_placeholder")} />
          </Form.Item>

          <Form.Item
            name="triggerMethod"
            label={t("function.trigger_method")}
            rules={[
              {required: true, message: t("function.trigger_method_required")},
            ]}
            initialValue="POST"
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="authMode"
            label={t("function.auth_mode")}
            rules={[
              {required: true, message: t("function.auth_mode_required")},
            ]}
            initialValue="PUBLIC"
          >
            <Select>
              <Select.Option value="PUBLIC">
                {t("function.auth_mode.public")}
              </Select.Option>
              <Select.Option value="JWT">
                {t("function.auth_mode.jwt")}
              </Select.Option>
              <Select.Option value="API_KEY">
                {t("function.auth_mode.api_key")}
              </Select.Option>
            </Select>
          </Form.Item>
        </>
      )}
    </div>
  );

  return (
    <Modal
      title={isEdit ? t("function.edit") : t("function.create")}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={860}
      destroyOnClose
      okText={isEdit ? t("function.deploy") : t("function.create_and_deploy")}
      cancelText={t("cancel")}
      styles={{
        body: {padding: "16px 24px"},
      }}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "basic",
              label: t("function.tab_basic"),
              children: basicTab,
            },
            {
              key: "code",
              label: t("function.tab_code"),
              children: (
                <div style={{paddingTop: 8}}>
                  <Form.Item
                    name="sourceCode"
                    rules={[
                      {required: true, message: t("function.source_code_required")},
                    ]}
                    getValueFromEvent={(val: string | undefined) => val || ""}
                  >
                    <ScriptEditor language="javascript" height={380} />
                  </Form.Item>
                </div>
              ),
            },
            ...(!isEdit
              ? [
                  {
                    key: "trigger",
                    label: t("function.tab_trigger"),
                    children: triggerTab,
                  },
                ]
              : []),
          ]}
        />
      </Form>
    </Modal>
  );
};

export default FunctionForm;
