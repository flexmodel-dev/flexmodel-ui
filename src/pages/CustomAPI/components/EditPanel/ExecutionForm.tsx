import React, {useCallback, useEffect, useRef, useState} from "react";
import {ApiMeta} from "@/types/api-management";
import {GraphQLEditorModal} from "@/components/common";
import ScriptEditorModal from "@/components/common/ScriptEditorModal";
import {Button, Card, Form, Radio, Tooltip} from "antd";
import {CodeOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import TextArea from "antd/es/input/TextArea";

interface ExecuteConfigProps {
  data: ApiMeta;
  onChange: (data: ApiMeta) => void;
}

const ExecutionForm: React.FC<ExecuteConfigProps> = ({data, onChange}: ExecuteConfigProps) => {
  const {t} = useTranslation();
  const [gqlEditorVisible, setGqlEditorVisible] = useState(false);
  const [preScriptEditorVisible, setPreScriptEditorVisible] = useState(false);
  const [postScriptEditorVisible, setPostScriptEditorVisible] = useState(false);
  const [scriptEditorVisible, setScriptEditorVisible] = useState(false);
  const [formData, setFormData] = useState<ApiMeta>(data);
  const [form] = Form.useForm();
  const prevDataRef = useRef<ApiMeta>(data);

  const handleGqlOpen = () => {
    setGqlEditorVisible(true);
  };

  const handleGqlClose = () => {
    setGqlEditorVisible(false);
  };

  const handlePreScriptOpen = () => {
    setPreScriptEditorVisible(true);
  };

  const handlePostScriptOpen = () => {
    setPostScriptEditorVisible(true);
  };

  // 表单数据回填 - 只在data真正变化时执行
  useEffect(() => {
    // 深度比较，避免不必要的更新
    const isDataChanged = JSON.stringify(data) !== JSON.stringify(prevDataRef.current);

    if (isDataChanged && data && Object.keys(data).length > 0) {
      form.setFieldsValue(data);
      setFormData(data);
      prevDataRef.current = data;
    }
  }, [data, form]);

  // 数据变化时通知父组件 - 使用useCallback避免无限循环
  const handleDataChange = useCallback(
    (newData: ApiMeta) => {
      // 避免重复调用onChange
      if (
        JSON.stringify(newData) !== JSON.stringify(prevDataRef.current)
      ) {
        prevDataRef.current = newData;
        onChange(newData);
      }
    },
    [onChange]
  );

  // 表单值变化处理
  const handleFormValuesChange = useCallback(
    (changedValues: Partial<ApiMeta>) => {
      // If execution is being updated, preserve executionType if not explicitly changing it
      const updatedChangedValues = changedValues.execution ? {
        ...changedValues,
        execution: {
          ...changedValues.execution,
          executionType: changedValues.execution.executionType || formData.execution?.executionType
        }
      } : changedValues;

      const newFormData = {...formData, ...updatedChangedValues};
      setFormData(newFormData);
      handleDataChange(newFormData);
    },
    [formData, handleDataChange]
  );


  const handleEditorChange = (r: any) => {
    const newData = {
      ...formData,
      execution: {
        ...formData.execution,
        ...r,
        executionType: formData.execution?.executionType || 'graphql'
      }
    };
    setFormData(newData);
    handleDataChange(newData);
  };

  const handleScriptChange = (value: string) => {
    const newData = {
      ...formData,
      execution: {
        ...formData.execution,
        executionScript: value,
        executionType: formData.execution?.executionType // Preserve current executionType
      }
    };
    setFormData(newData);
    handleDataChange(newData);
  };

  return (
    <Card
      className="h-full"
      style={{height: 'calc(100vh - 200px)', overflow: 'scroll'}}
    >
      <Form
        form={form}
        initialValues={{
          ...data,
          execution: {...data.execution, executionType: data.execution?.executionType || 'graphql'}
        }}
        labelCol={{span: 3}}
        wrapperCol={{span: 21}}
        layout="horizontal"
        onValuesChange={handleFormValuesChange}
      >

        <Form.Item name={['execution', 'preScript']} label={t("apis.execution.pre_script")}>
          <div style={{position: 'relative'}}>
            <TextArea
              readOnly
              size="large"
              rows={3}
              value={formData?.execution?.preScript || ""}
              placeholder={t("apis.execution.placeholder")}
              onDoubleClick={handlePreScriptOpen}
              style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
            />
            <Tooltip title={t("apis.execution.open_pre_script_editor")}>
              <Button
                type="text"
                icon={<CodeOutlined/>}
                onClick={handlePreScriptOpen}
                style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
              />
            </Tooltip>
          </div>
        </Form.Item>
        <Form.Item name={['execution', 'executionType']} label={t("apis.execution.execution_type")}
                   initialValue="graphql">
          <Radio.Group onChange={(e) => {
            const newExecutionType = e.target.value;
            // Update formData immediately when execution type changes
            const newFormData = {
              ...formData,
              execution: {
                ...formData.execution,
                executionType: newExecutionType
              }
            };
            setFormData(newFormData);
            handleDataChange(newFormData);
          }}>
            <Radio value="graphql">{t("graphql_api")}</Radio>
            <Radio value="script">{t("apis.execution.script")}</Radio>
          </Radio.Group>
        </Form.Item>
        {(formData?.execution?.executionType === 'graphql' || formData?.execution?.executionType == null) && (
          <Form.Item name={['execution', 'query']} label={t("apis.execution.graphql_query")}>
            <div style={{position: 'relative'}}>
              <TextArea
                readOnly
                size="large"
                rows={3}
                value={formData?.execution?.query || ""}
                placeholder={t("apis.execution.placeholder")}
                onDoubleClick={handleGqlOpen}
                style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
              />
              <Tooltip title={t("apis.graphql.open_editor")}>
                <Button
                  type="text"
                  icon={<CodeOutlined/>}
                  onClick={handleGqlOpen}
                  style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
                />
              </Tooltip>
            </div>
          </Form.Item>
        )}
        {formData?.execution?.executionType === 'script' && (
          <Form.Item name={['execution', 'executionScript']} label={t("apis.execution.execution_script")}>
            <div style={{position: 'relative'}}>
              <TextArea
                readOnly
                size="large"
                rows={3}
                value={formData?.execution?.executionScript || ""}
                placeholder={t("apis.execution.placeholder")}
                onDoubleClick={() => setScriptEditorVisible(true)}
                style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
              />
              <Tooltip title={t("apis.execution.open_script_editor")}>
                <Button
                  type="text"
                  icon={<CodeOutlined/>}
                  onClick={() => setScriptEditorVisible(true)}
                  style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
                />
              </Tooltip>
            </div>
          </Form.Item>
        )
        }
        <Form.Item name={['execution', 'postScript']} label={t("apis.execution.post_script")}>
          <div style={{position: 'relative'}}>
            <TextArea
              readOnly
              size="large"
              rows={3}
              value={formData?.execution?.postScript || ""}
              placeholder={t("apis.execution.placeholder")}
              onDoubleClick={handlePostScriptOpen}
              style={{borderRadius: '6px', border: '1px solid #d9d9d9'}}
            />
            <Tooltip title={t("apis.execution.open_post_script_editor")}>
              <Button
                type="text"
                icon={<CodeOutlined/>}
                onClick={handlePostScriptOpen}
                style={{position: 'absolute', top: 8, right: 8, padding: '4px 12px', borderRadius: '4px'}}
              />
            </Tooltip>
          </div>
        </Form.Item>
      </Form>
      {gqlEditorVisible && (
        <GraphQLEditorModal
          visible={gqlEditorVisible}
          value={{
            query: formData.execution?.query || "",
            variables: formData.execution?.variables,
            operationName: formData.execution?.operationName,
            headers: formData.execution?.headers
          }}
          onChange={handleEditorChange}
          onClose={handleGqlClose}
        />
      )}
      <ScriptEditorModal
        visible={preScriptEditorVisible}
        value={formData?.execution?.preScript || ""}
        onChange={(value: string) => {
          const newData = {
            ...formData,
            execution: {
              ...formData.execution,
              preScript: value,
              executionType: formData.execution?.executionType // Preserve executionType
            }
          };
          setFormData(newData);
          handleDataChange(newData);
        }}
        onClose={() => setPreScriptEditorVisible(false)}
        title={t("apis.execution.pre_script_editor")}
        description={t("apis.execution.pre_script_description")}
      />
      <ScriptEditorModal
        visible={postScriptEditorVisible}
        value={formData?.execution?.postScript || ""}
        onChange={(value: string) => {
          const newData = {
            ...formData,
            execution: {
              ...formData.execution,
              postScript: value,
              executionType: formData.execution?.executionType // Preserve executionType
            }
          };
          setFormData(newData);
          handleDataChange(newData);
        }}
        onClose={() => setPostScriptEditorVisible(false)}
        title={t("apis.execution.post_script_editor")}
        description={t("apis.execution.post_script_description")}
      />
      <ScriptEditorModal
        visible={scriptEditorVisible}
        value={formData?.execution?.executionScript || ""}
        onChange={handleScriptChange}
        onClose={() => setScriptEditorVisible(false)}
        title={t("apis.execution.script_editor")}
        description={t("apis.execution.script_description")}
      />
    </Card>
  );
};
export default ExecutionForm;
