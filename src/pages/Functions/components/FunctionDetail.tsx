import React, {useState} from "react";
import {
  Descriptions,
  Spin,
  Tag,
  Tabs,
  theme,
} from "antd";
import {
  CodeOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import ScriptEditor from "@/components/common/ScriptEditor";
import FunctionInvokePanel from "./FunctionInvokePanel";
import type {FunctionResponse} from "@/services/function";

interface FunctionDetailProps {
  fn: FunctionResponse | null;
  loading: boolean;
  projectId: string;
  onRefresh: () => void;
}

const FunctionDetail: React.FC<FunctionDetailProps> = ({
  fn,
  loading,
  projectId,
}) => {
  const {t} = useTranslation();
  const {token} = theme.useToken();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFile, setActiveFile] = useState("index.ts");

  if (loading || !fn) {
    return (
      <div style={{textAlign: "center", padding: 48}}>
        <Spin/>
      </div>
    );
  }

  // Parse source files
  const sourceFiles = fn.sourceFiles || {};
  const fileList = Object.keys(sourceFiles);

  // ---- Overview Tab ----
  const overviewTab = (
    <div>
      <Descriptions
        column={2}
        bordered
        size="small"
        labelStyle={{fontWeight: 500, width: 100}}
      >
        <Descriptions.Item label={t("function.name")}>{fn.name}</Descriptions.Item>
        <Descriptions.Item label={t("function.createdAt")}>
          {fn.createdAt ? new Date(fn.createdAt).toLocaleString() : "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("function.endpoint")} span={2}>
          <code style={{fontSize: 12}}>POST /projects/{projectId}/functions/{fn.name}/invoke</code>
        </Descriptions.Item>
        <Descriptions.Item label={t("function.updatedAt")}>
          {fn.updatedAt ? new Date(fn.updatedAt).toLocaleString() : "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("function.files")} span={2}>
          {fileList.length > 0
            ? fileList.map((f) => <Tag key={f}>{f}</Tag>)
            : "-"
          }
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  // ---- Code Tab ----
  const codeTab = (
    <div>
      <div style={{marginBottom: 8, display: "flex", gap: 4, flexWrap: "wrap"}}>
        {fileList.map((filename) => (
          <Tag
            key={filename}
            color={activeFile === filename ? token.colorPrimary : "default"}
            style={{cursor: "pointer"}}
            onClick={() => setActiveFile(filename)}
          >
            {filename}
          </Tag>
        ))}
      </div>
      <ScriptEditor
        language="typescript"
        height={420}
        readOnly
        value={sourceFiles[activeFile] || "// No content"}
      />
    </div>
  );

  // ---- Test Tab ----
  const testTab = (
    <FunctionInvokePanel projectId={projectId} functionName={fn.name}/>
  );

  const tabItems = [
    {
      key: "overview",
      label: <span><InfoCircleOutlined/> {t("function.tabOverview")}</span>,
      children: overviewTab,
    },
    {
      key: "code",
      label: <span><CodeOutlined/> {t("function.tabCode")}</span>,
      children: codeTab,
    },
    {
      key: "test",
      label: <span><PlayCircleOutlined/> {t("function.tabTest")}</span>,
      children: testTab,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
    />
  );
};

export default FunctionDetail;
