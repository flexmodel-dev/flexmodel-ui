import React from "react";
import { Button, Card, Flex, Input, Select, Space, Typography } from "antd";
import Editor from "@monaco-editor/react";
import { useAppStore } from "@/store/appStore";

interface MethodOption {
  value: string;
  label: string;
}

interface DebugPanelProps {
  method: string;
  path: string;
  headers: string;
  body: string;
  response: string;
  responseStatus: string;
  loading: boolean;
  methodOptions: MethodOption[];
  apiRootPath?: string;
  onMethodChange: (value: string) => void;
  onPathChange: (value: string) => void;
  onHeadersChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSend: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  method,
  path,
  headers,
  body,
  response,
  responseStatus,
  loading,
  methodOptions,
  apiRootPath,
  onMethodChange,
  onPathChange,
  onHeadersChange,
  onBodyChange,
  onSend,
}) => {
  const { currentProject } = useAppStore();
  const fullApiRootPath = `${apiRootPath || ''}/${currentProject?.id}`;

  const shouldShowRequestBody = !["GET", "HEAD"].includes(
    method.toUpperCase()
  );

  const formatJSON = (text: string): string => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  const handleFormatHeaders = () => {
    const formatted = formatJSON(headers);
    onHeadersChange(formatted);
  };

  const handleFormatBody = () => {
    const formatted = formatJSON(body);
    onBodyChange(formatted);
  };

  const responseDisplay = React.useMemo(() => {
    try {
      const parsed = JSON.parse(response);
      return {
        content: JSON.stringify(parsed, null, 2),
        language: "json" as const,
      };
    } catch {
      return {
        content: response,
        language: "plaintext" as const,
      };
    }
  }, [response]);

  return (
    <Card className="h-full"
      style={{ height: 'calc(100vh - 180px)', overflow: 'scroll' }}>
      <Space
        orientation="vertical"
        size="middle"
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Flex gap="small" align="center" wrap>
          <Select
            value={method}
            onChange={onMethodChange}
            options={methodOptions}
            style={{ minWidth: 100 }}
          />
          <Input
            value={path}
            onChange={(e) => onPathChange(e.target.value)}
            className="flex-1"
            prefix={<span>{fullApiRootPath}</span>}
            placeholder="/example/path"
          />
          <Button type="primary" onClick={onSend} loading={loading}>
            调试执行
          </Button>
        </Flex>

        <Space orientation="vertical" size="small" style={{ width: "100%" }}>
          <Flex justify="space-between" align="center">
            <Typography.Text strong>请求头（JSON）</Typography.Text>
            <Button size="small" onClick={handleFormatHeaders}>
              格式化
            </Button>
          </Flex>
          <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px", overflow: "hidden" }}>
            <Editor
              height="150px"
              defaultLanguage="json"
              value={headers}
              onChange={(value) => onHeadersChange(value || "")}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 12,
                lineNumbers: "on",
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true,
              }}
            />
          </div>
        </Space>

        {shouldShowRequestBody && (
          <Space orientation="vertical" size="small" style={{ width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Typography.Text strong>请求体</Typography.Text>
              <Button size="small" onClick={handleFormatBody}>
                格式化
              </Button>
            </Flex>
            <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px", overflow: "hidden" }}>
              <Editor
                height="200px"
                defaultLanguage="json"
                value={body}
                onChange={(value) => onBodyChange(value || "")}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 12,
                  lineNumbers: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </Space>
        )}

        <Space
          orientation="vertical"
          size="small"
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Typography.Text strong>
            响应{responseStatus ? `（${responseStatus}）` : ""}
          </Typography.Text>
          <div style={{
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            overflow: "hidden",
            flex: 1,
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
          }}>
            <Editor
              height="300px"
              language={responseDisplay.language}
              value={responseDisplay.content}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 12,
                lineNumbers: "on",
                readOnly: true,
                automaticLayout: true,
              }}
            />
          </div>
        </Space>
      </Space>
    </Card>
  );
};

export default DebugPanel;

