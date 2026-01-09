import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Space, Table, theme} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {useTranslation} from 'react-i18next';
import {executeNativeQuery} from '@/services/datasource.ts';
import type {NativeQueryModel} from '@/types/data-modeling';
import {useProject} from '@/store/appStore';

interface NativeQueryFormProps {
  form?: any;
  mode?: 'create' | 'edit' | 'view';
  datasource?: string;
  model?: Partial<NativeQueryModel>;
  onConfirm?: (model: NativeQueryModel) => void;
}

const NativeQueryForm = React.forwardRef<any, NativeQueryFormProps>(({
  form: externalForm,
  mode = 'create',
  datasource,
  model,
  onConfirm
}, ref) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [paramsForm] = Form.useForm();

  const [execResult, setExecResult] = useState<{ result: any[]; time: number }>({
    result: [],
    time: 0,
  });
  const [columns, setColumns] = useState<any[]>([]);
  const [paramsDialogVisible, setParamsDialogVisible] = useState(false);
  const [params, setParams] = useState<string[]>([]);

  // 暴露提交方法给父组件
  React.useImperativeHandle(ref, () => ({
    submit: handleSave,
    reset: () => {
      form.resetFields();
      resetExecutionState();
    },
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));

  // 初始化表单值
  useEffect(() => {
    if (model) {
      form.setFieldsValue(model);
      resetExecutionState();
    }
  }, [model, form]);

  const resetExecutionState = () => {
    setColumns([]);
    setExecResult({
      result: [],
      time: 0,
    });
  };

  const extractParameters = (text: string): string[] => {
    return [...new Set([...text.matchAll(/\${(.*?)}/g)].map((match) => match[1]))];
  };

  const handleNativeQueryExecute = async () => {
    try {
      await form.validateFields();
      const statement = form.getFieldValue("statement");
      const extractedParams = extractParameters(statement);

      if (extractedParams.length > 0) {
        setParams(extractedParams);
        setParamsDialogVisible(true);
      } else {
        await executeQuery();
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  const executeQuery = async () => {
    if (!projectId || !datasource) {
      message.error(t("project_or_datasource_required"));
      return;
    }
    
    try {
      const res = await executeNativeQuery(projectId, datasource, {
        statement: form.getFieldValue("statement"),
        parameters: paramsForm.getFieldsValue(),
      });

      setExecResult(res);
      setColumns(
        res.result.length
          ? Object.keys(res.result[0]).map((key) => ({
            key,
            title: key,
            dataIndex: key,
            width: 100,
            ellipsis: true,
            render: (text: any) => `${text}`,
          }))
          : []
      );
    } catch (error) {
      console.error("Query execution failed", error);
      message.error(t("query_execution_failed"));
    }
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      const formData = {
        name: form.getFieldValue("name"),
        statement: form.getFieldValue("statement"),
        type: "native_query" as const,
      };
      if (onConfirm) {
        onConfirm(formData);
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  const formStyle = {};

  const spaceStyle = {
    gap: token.marginXS,
  };

  const resultInfoStyle = {
    fontSize: token.fontSizeSM,
    color: token.colorTextSecondary,
  };

  const tableStyle = {
    marginTop: token.marginSM,
  };

  return (
    <>
      <Form form={form} initialValues={model} layout="vertical" style={formStyle} variant={mode === "view" ? "borderless" : "outlined"}>
        <Form.Item 
          name="name" 
          label={t("name")} 
          rules={mode !== 'view' ? [{ required: true }] : []}
        >
          <Input readOnly={mode === 'view' || (!!model && mode === 'edit')} size="small" />
        </Form.Item>
        <Form.Item 
          name="statement" 
          label={t("statement")} 
          rules={mode !== 'view' ? [{ required: true }] : []}
        >
          <TextArea rows={4} readOnly={mode === 'view'} size="small" />
        </Form.Item>
        {mode !== 'view' && (
          <Form.Item>
            <Space align="end" style={{ float: "right", ...spaceStyle }}>
              <div style={resultInfoStyle}>
                {t("time_taken")}: {execResult.time}ms; {t("total_results")}: {execResult.result.length}
              </div>
              <Button type="default" onClick={handleNativeQueryExecute} size="small">
                {t("execute")}
              </Button>
              {onConfirm && (
                <Button type="primary" onClick={handleSave} size="small">
                  {t("save")}
                </Button>
              )}
            </Space>
          </Form.Item>
        )}
        {mode === 'view' && (
          <Form.Item>
            <Space align="end" style={{ float: "right", ...spaceStyle }}>
              <div style={resultInfoStyle}>
                {t("time_taken")}: {execResult.time}ms; {t("total_results")}: {execResult.result.length}
              </div>
              <Button type="default" onClick={handleNativeQueryExecute} size="small">
                {t("execute")}
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>

      <Table
        size="small"
        columns={columns}
        dataSource={execResult.result}
        rowKey="id"
        style={tableStyle}
        pagination={{
          size: 'small',
          pageSize: 10,
          showSizeChanger: false,
        }}
      />

      <Modal
        title={t("parameters")}
        open={paramsDialogVisible}
        onOk={async () => {
          await executeQuery();
          setParamsDialogVisible(false);
        }}
        onCancel={() => setParamsDialogVisible(false)}
      >
        <Form form={paramsForm} layout="vertical">
          {params.map((param) => (
            <Form.Item key={param} name={param} label={param}>
              <Input size="small" />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
});

export default NativeQueryForm;
