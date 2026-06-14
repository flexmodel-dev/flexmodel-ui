import React, {useState} from "react";
import {
  Alert,
  Button,
  Card,
  message,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  theme,
  Typography,
} from "antd";
import {SendOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import type {
  FunctionInvokeRequest,
  FunctionInvokeResponse,
} from "@/services/function";
import {invokeFunction} from "@/services/function";

const {Text, Paragraph} = Typography;

interface FunctionInvokePanelProps {
  projectId: string;
  functionName: string;
}

const FunctionInvokePanel: React.FC<FunctionInvokePanelProps> = ({
  projectId,
  functionName,
}) => {
  const {t} = useTranslation();
  const {token} = theme.useToken();
  const [method, setMethod] = useState("POST");
  const [headersStr, setHeadersStr] = useState('{"Content-Type": "application/json"}');
  const [bodyStr, setBodyStr] = useState("{}");
  const [queryStr, setQueryStr] = useState("");
  const [invoking, setInvoking] = useState(false);
  const [response, setResponse] = useState<FunctionInvokeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvoke = async () => {
    setInvoking(true);
    setResponse(null);
    setError(null);

    let headers: Record<string, string> = {};
    let body: any = undefined;
    let query: Record<string, string> = {};

    try {
      if (headersStr.trim()) {
        headers = JSON.parse(headersStr);
      }
    } catch {
      message.error(t("function.invokeHeadersJsonError"));
      setInvoking(false);
      return;
    }

    try {
      if (bodyStr.trim()) {
        body = JSON.parse(bodyStr);
      }
    } catch {
      message.error(t("function.invokeBodyJsonError"));
      setInvoking(false);
      return;
    }

    try {
      if (queryStr.trim()) {
        query = JSON.parse(queryStr);
      }
    } catch {
      message.error(t("function.invokeQueryJsonError"));
      setInvoking(false);
      return;
    }

    try {
      const req: FunctionInvokeRequest = {
        method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: body !== undefined ? body : undefined,
        query: Object.keys(query).length > 0 ? query : undefined,
      };
      const res = await invokeFunction(projectId, functionName, req);
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setInvoking(false);
    }
  };

  const formatBody = (body: any): string => {
    if (typeof body === "string") return body;
    return JSON.stringify(body, null, 2);
  };

  return (
    <div>
      <Paragraph type="secondary">
        {t("function.invokeHint")}
      </Paragraph>

      {/* Request Builder */}
      <Card
        size="small"
        title={t("function.invokeRequest")}
        style={{marginBottom: 16}}
      >
        <div style={{display: "flex", gap: 12, marginBottom: 12, alignItems: "center"}}>
          <Select
            value={method}
            onChange={setMethod}
            style={{width: 100}}
          >
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
          </Select>
          <code style={{flex: 1, fontSize: 12, padding: "4px 8px", background: token.colorFillSecondary, borderRadius: token.borderRadius}}>
            /functions/{functionName}
          </code>
        </div>

        <Tabs
          size="small"
          items={[
            {
              key: "body",
              label: t("function.invokeBody"),
              children: (
                <div>
                  <ScriptEditor
                    language="json"
                    height={160}
                    value={bodyStr}
                    onChange={(v) => setBodyStr(v || "{}")}
                  />
                </div>
              ),
            },
            {
              key: "headers",
              label: t("function.invokeHeaders"),
              children: (
                <div>
                  <ScriptEditor
                    language="json"
                    height={160}
                    value={headersStr}
                    onChange={(v) => setHeadersStr(v || "{}")}
                  />
                </div>
              ),
            },
            {
              key: "query",
              label: t("function.invokeQuery"),
              children: (
                <div>
                  <ScriptEditor
                    language="json"
                    height={160}
                    value={queryStr}
                    onChange={(v) => setQueryStr(v || "")}
                  />
                </div>
              ),
            },
          ]}
        />

        <div style={{marginTop: 12, textAlign: "right"}}>
          <Button
            type="primary"
            icon={<SendOutlined/>}
            loading={invoking}
            onClick={handleInvoke}
          >
            {t("function.invokeSend")}
          </Button>
        </div>
      </Card>

      {/* Response Viewer */}
      {(response || error || invoking) && (
        <Card
          size="small"
          title={t("function.invokeResponse")}
        >
          {invoking ? (
            <div style={{textAlign: "center", padding: 32}}>
              <Spin tip={t("function.invokeExecuting")}/>
            </div>
          ) : error ? (
            <Alert
              type="error"
              message={t("function.invokeError")}
              description={error}
              showIcon
            />
          ) : response ? (
            <div>
              <Space style={{marginBottom: 12}}>
                <Text strong>{t("status")}: </Text>
                <Tag
                  color={
                    response.status >= 200 && response.status < 300
                      ? "green"
                      : response.status >= 400
                        ? "red"
                        : "orange"
                  }
                >
                  {response.status}
                </Tag>
                {response._meta && (
                  <Text type="secondary">
                    {response._meta.executionTimeMs}ms
                  </Text>
                )}
              </Space>

              <Tabs
                size="small"
                items={[
                  {
                    key: "body",
                    label: t("function.invokeResponseBody"),
                    children: (
                      <ScriptEditor
                        language="json"
                        height={200}
                        readOnly
                        value={formatBody(response.body)}
                      />
                    ),
                  },
                  ...(response._meta?.logs && response._meta.logs.length > 0
                    ? [
                        {
                          key: "logs",
                          label: t("function.invokeLogs"),
                          children: (
                            <div
                              style={{
                                maxHeight: 200,
                                overflow: "auto",
                                background: token.colorFillSecondary,
                                borderRadius: token.borderRadius,
                                padding: 12,
                                fontFamily: "monospace",
                                fontSize: 12,
                              }}
                            >
                              {response._meta.logs.map((log, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: "2px 0",
                                    color:
                                      log.level === "error"
                                        ? token.colorError
                                        : log.level === "warn"
                                          ? token.colorWarning
                                          : token.colorText,
                                  }}
                                >
                                  [{log.level.toUpperCase()}] {log.message}
                                </div>
                              ))}
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default FunctionInvokePanel;
