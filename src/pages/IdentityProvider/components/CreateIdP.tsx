import React, {useState} from 'react';
import {Button, Col, Drawer, Form, Input, message, Radio, Row, Steps} from 'antd';
import {createIdentityProvider} from "@/services/identity-provider.ts";
import {useTranslation} from "react-i18next";
import OIDCIdPForm from "@/pages/IdentityProvider/components/OIDCIdPForm";
import JsIdPForm from "@/pages/IdentityProvider/components/JsIdPForm.tsx";
import {useProject} from "@/store/appStore";

interface CreateIdPProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (provider: any) => void;
}

const CreateIdP: React.FC<CreateIdPProps> = ({ open, onClose, onConfirm }) => {

  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';

  const [form] = Form.useForm();
  const JAVASCRIPT_TEMPLATE = `/**
/**
 * Execution context: encapsulates request, response, and environment utilities
 * context = {
 *   request: {
 *     method,
 *     url,
 *     headers,
 *     body,
 *     query
 *   },
 *   response: {
 *     status,
 *     headers,
 *     body
 *   },
 *   log(msg) {},
 *   utils: {
 *     md5(str) {},
 *     jwtVerify(token) {}
 *   }
 * }
 *
 */
`;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'oidc',
    issuer: '',
    clientId: '',
    clientSecret: '',
    script: ''
  });

  const next = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleCreateProvider = async () => {
    if (!projectId) {
      message.error('Project ID is required');
      return;
    }
    
    try {
      const values = await form.validateFields();
      const newProvider = {
        name: values.name,
        provider: values,
        createdAt: '',
        updatedAt: ''
      };
      const res = await createIdentityProvider(projectId, newProvider);
      setFormData(res);
      message.success('Provider created successfully');
      next();
      onConfirm(res);
    } catch (error) {
      console.log(error)
      message.error('Failed to create provider');
    }
  };

  const segmentTitle = "text-[16px] font-bold pb-[10px]";

  return (
    <Drawer
      title={t('idp_new_provider')}
      size={800}
      open={open}
      onClose={onClose}
      footer={
        <>
          {currentStep !== 0 && currentStep !== 2 && (
            <Button onClick={prev} style={{ marginRight: 8 }}>
              {t('idp_btn_go_back')}
            </Button>
          )}
          {currentStep === 0 && (
            <Button type="primary" onClick={next}>
              {t('idp_btn_select_provider')}
            </Button>
          )}
          {currentStep === 1 && (
            <Button type="primary" onClick={handleCreateProvider}>
              {t('idp_btn_create_provider')}
            </Button>
          )}
        </>
      }
    >
      <Steps
        current={currentStep}
        size="small"
        items={[
          { title: t('idp_step_select_provider') },
          { title: t('idp_step_create_provider') },
          { title: t('idp_step_success') }
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(changedValues) => {
          setFormData((prev: any) => {
            const next = { ...prev, ...changedValues };
            if (changedValues.type === 'script' && !next.script) {
              next.script = JAVASCRIPT_TEMPLATE;
              form.setFieldsValue({ script: JAVASCRIPT_TEMPLATE });
            }
            return next;
          });
        }}
        style={{ marginTop: 24 }}
      >
        <Form.Item hidden name="type" initialValue="oidc">
          <Input />
        </Form.Item>
        {currentStep === 0 && (
          <Form.Item name="type" initialValue="oidc" label={t('idp_create_tips')}>
            <Radio.Group name="type">
              <div className={segmentTitle}>{t('idp_user_defined')}</div>
              <Radio value="oidc">OpenID Connect (oidc)</Radio>
              <Radio value="script">{t('idp_script')} (script)</Radio>
              <div className={segmentTitle}>{t('idp_social')}</div>
              <Radio value="github" disabled>
                Github (github)
              </Radio>
              <Radio value="google" disabled>
                Google (google)
              </Radio>
            </Radio.Group>
          </Form.Item>
        )}

        {currentStep === 1 && formData.type === 'oidc' && (
          <OIDCIdPForm />
        )}
        {currentStep === 1 && formData.type === 'script' && (
          <JsIdPForm />
        )}

        {currentStep === 2 && (
          <Row justify="center">
            <Col span={24} style={{ textAlign: 'center' }}>
              <p>Created successfully</p>
              <Form
                layout="horizontal"
                labelCol={{ style: { width: 160 } }}
                colon={false}
                variant="borderless"
                initialValues={formData}
              >
                {formData.type === 'oidc' && (
                  <OIDCIdPForm readOnly />
                )}
                {formData.type === 'script' && (
                  <JsIdPForm readOnly />
                )}
              </Form>
              <Button type="primary" style={{ marginTop: 12 }} onClick={() => {
                onClose();
                setCurrentStep(0);
              }}>
                Close
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateIdP;
