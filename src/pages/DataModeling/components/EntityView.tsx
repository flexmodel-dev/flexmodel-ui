import {CodeOutlined} from "@ant-design/icons";
import {Button, Col, Popover, Row, Segmented, Space, Typography,} from "antd";
import {useState} from "react";
import {useTranslation} from "react-i18next";

import FieldList from "./FieldList";
import IndexList from "./IndexList";
import RecordList from "./RecordList";
import TriggerWrapper from "@/pages/DataModeling/components/TriggerWrapper.tsx";

interface Props {
  model: any;
}

const EntityView = ({model}: Props) => {
  const {t} = useTranslation();
  const [selectedItem, setSelectedItem] = useState<string>("field");

  const options = [
    {label: t("field"), value: "field"},
    {label: t("index"), value: "index"},
    {label: t("record"), value: "record"},
    {label: t("trigger.title"), value: "trigger"},
  ];

  const renderContent = () => {
    switch (selectedItem) {
      case "field":
        return <FieldList model={model}/>;
      case "index":
        return <IndexList model={model}/>;
      case "record":
        return <RecordList model={model}/>;
      case "trigger":
        return <TriggerWrapper model={model}/>;
      default:
        return null;
    }
  };

  return (
    <>
      <Row align="middle" justify="space-between" style={{marginBottom: 16}}>
        <Col>
          <Space align="center">
            <Typography.Title level={5} style={{margin: 0}}>
              {model?.name} {model?.comment}
            </Typography.Title>
            <Popover
              content={
                <div>
                  <Typography.Paragraph
                    copyable
                    style={{whiteSpace: "pre-wrap", margin: "8px 0 0 0"}}
                  >
                    {model?.idl}
                  </Typography.Paragraph>
                </div>
              }
              title="接口描述"
            >
              <Button icon={<CodeOutlined/>} type="text" size="small"/>
            </Popover>
          </Space>
        </Col>
        <Col>
          <Segmented
            options={options}
            value={selectedItem}
            onChange={(val) => setSelectedItem(val as string)}
            size="small"
          />
        </Col>
      </Row>
      {renderContent()}
    </>
  );
};

export default EntityView;
