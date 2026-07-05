import React, {useState} from "react";
import {Alert, Button, Card, message, Space, Spin, Tabs, Tag, theme, Typography,} from "antd";
import {SendOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import type {FunctionInvokeResult,} from "@/services/function";
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
  const [inputStr, setInputStr] = useState("{}");
  const [invoking, setInvoking] = useState(false);
  const [response, setResponse] = useState<FunctionInvokeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvoke = async () => {
    setInvoking(true);
    setResponse(null);
    setError(null);

    let input: any = undefined;

    try {
      if (inputStr.trim()) {
        input = JSON.parse(inputStr);
      }
    } catch {
      message.error(t("function.invokeInputJsonError"));
      setInvoking(false);
      return;
    }

    try {
      const res = await invokeFunction(projectId, functionName, { input });
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setInvoking(false);
    }
  };

  const formatData = (data: any): string => {
    if (typeof data === "string") return data;
    return JSON.stringify(data, null, 2);
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
        <div style={{marginBottom: 12}}>
          <code style={{fontSize: 12, padding: "4px 8px", background: token.colorFillSecondary, borderRadius: token.borderRadius}}>
            POST /api/projects/{projectId}/functions/{functionName}/invoke
          </code>
        </div>

        <div style={{marginBottom: 8}}>
          <Text strong>{t("function.invokeInput")}</Text>
        </div>
        <ScriptEditor
          language="json"
          height={160}
          value={inputStr}
          onChange={(v) => setInputStr(v || "{}")}
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
                      ? token.colorSuccess
                      : response.status >= 400
                        ? token.colorError
                        : token.colorWarning
                  }
                >
                  {response.status}
                </Tag>
                {response.meta && (
                  <Text type="secondary">
                    {response.meta.executionTimeMs}ms
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
                        value={formatData(response.data)}
                      />
                    ),
                  },
                  ...(response.meta?.logs && response.meta.logs.length > 0
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
                              {response.meta.logs.map((log, i) => (
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
