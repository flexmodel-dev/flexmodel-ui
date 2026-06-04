import React, { useRef } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/store/appStore";
import Editor from "@monaco-editor/react";

const SCRIPT_TEMPLATE = `/**
 * Auth script context:
 * context = {
 *   projectId,
 *   bearerToken,
 *   method,
 *   url,
 *   headers,
 *   query
 * }
 *
 * Must return: { success: boolean, caller: string, scopes: string[] }
 */
function authenticate(context) {
  // Your authentication logic here
  return { success: false, caller: '', scopes: [] };
}
`;

const ScriptForm: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const editorRef = useRef<any>(null);

  return (
    <Form.Item
      name="script"
      label={t("script")}
      tooltip={t("script_tooltip") || undefined}
      rules={[{ required: true, message: t("script_required") }]}
      initialValue={SCRIPT_TEMPLATE}
    >
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue, setFieldValue }) => (
          <div style={{ border: "1px solid var(--ant-color-border)", borderRadius: 6, overflow: "hidden" }}>
            <Editor
              height="340px"
              language="javascript"
              value={getFieldValue("script") ?? SCRIPT_TEMPLATE}
              onChange={(val) => setFieldValue("script", val ?? "")}
              onMount={(editor) => { editorRef.current = editor; }}
              theme={isDark ? "vs-dark" : "vs"}
              options={{
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </div>
        )}
      </Form.Item>
    </Form.Item>
  );
};

export default ScriptForm;
