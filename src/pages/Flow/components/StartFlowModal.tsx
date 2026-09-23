import React, {useEffect, useState} from 'react';
import {Form, Input, message, Modal, Select, Spin} from 'antd';
import Editor from '@monaco-editor/react';
import {getDarkModeFromStorage} from '@/utils/darkMode';
import {FlowModule, getFlowList, isSuccess, startProcess} from '@/services/flow';

interface StartFlowModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onStarted?: (flowInstanceId: string) => void;
}

const StartFlowModal: React.FC<StartFlowModalProps> = ({visible, projectId, onClose, onStarted}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flowList, setFlowList] = useState<FlowModule[]>([]);
  const [flowModuleId, setFlowModuleId] = useState<string | undefined>();
  const [initiator, setInitiator] = useState<string>('');
  const [variablesText, setVariablesText] = useState<string>('{}');
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible || !projectId) return;
    setLoading(true);
    getFlowList(projectId, {page: 1, size: 100})
      .then(res => setFlowList(res.list || []))
      .catch(e => {
        console.error('获取流程列表失败:', e);
        message.error('获取流程列表失败');
      })
      .finally(() => setLoading(false));
  }, [visible, projectId]);

  const handleOk = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    let variables: Record<string, any> = {};
    const text = (variablesText || '').trim();
    if (text.length > 0) {
      try {
        variables = JSON.parse(text);
      } catch {
        message.error('变量需为合法的 JSON');
        return;
      }
    }
    setSubmitting(true);
    try {
      const {errCode, errMsg, flowInstanceId} = await startProcess(projectId, {
        flowModuleId: flowModuleId,
        initiator: initiator || undefined,
        variables: variables,
      });
      if (!isSuccess(errCode)) {
        message.warning(errMsg);
        return;
      }
      message.success('流程发起成功');
      if (onStarted) onStarted(flowInstanceId);
      handleReset();
      onClose();
    } catch (e) {
      console.error('发起流程失败:', e);
      message.error('发起流程失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFlowModuleId(undefined);
    setInitiator('');
    setVariablesText('{}');
  };

  const isDark = getDarkModeFromStorage();

  return (
    <Modal
      title='发起流程'
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      okText='发起'
      cancelText='取消'
      confirmLoading={submitting}
      width={560}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout='vertical'>
          <Form.Item label='选择流程' name='flowModuleId' rules={[{required: true, message: '请选择流程'}]}>
            <Select
              placeholder='请选择要发起的流程'
              showSearch
              optionFilterProp='label'
              value={flowModuleId}
              onChange={setFlowModuleId}
              options={flowList.map(f => ({label: `${f.flowName} (${f.flowKey})`, value: f.flowModuleId}))}
            />
          </Form.Item>
          <Form.Item label='发起人（可选）' name='initiator'>
            <Input placeholder='留空使用当前登录用户' value={initiator} onChange={e => setInitiator(e.target.value)}
                   allowClear/>
          </Form.Item>
          <Form.Item label='流程变量（JSON，可选）'>
            <div style={{border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden'}}>
              <Editor
                height='200px'
                defaultLanguage='json'
                value={variablesText}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{
                  minimap: {enabled: false},
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                onChange={(value) => setVariablesText((value || '').toString())}
              />
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default StartFlowModal;
