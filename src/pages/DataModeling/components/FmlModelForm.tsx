import React, {useState} from 'react';
import {message, theme} from 'antd';
import {useTranslation} from 'react-i18next';
import {ScriptImportPayload, ScriptType} from '@/types/data-source';
import FmlEditor from './FmlEditor';

interface FmlModelFormProps {
  mode: 'create' | 'edit';
  currentValue?: any;
  onConfirm: (form: any) => void;
  onCancel: () => void;
}

const FmlModelForm = ({
  mode: _mode,
  currentValue: _currentValue,
  onConfirm,
  onCancel,
                        ref,
                      }: FmlModelFormProps & { ref?: React.Ref<any> }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const resetForm = () => {
    setFmlCode(`// ${t('fml_syntax_example')}
model example_model {
  id : String @id @default(ulid()),
  name : String @length("255") @comment("${t('name')}"),
  createdAt : DateTime @default(now()),
  enabled : Boolean @default("true"),
}

enum ExampleEnum {
  VALUE1,
  VALUE2,
  VALUE3
}`);
  };

  const [fmlCode, setFmlCode] = useState(`// ${t('fml_syntax_example')}
model example_model {
  id : Long @id @default(autoIncrement()),
  name : String @length("255") @comment("${t('name')}"),
  createdAt : DateTime @default(now()),
  enabled : Boolean @default("true"),
  @index(name: "IDX_name", unique: true, fields: [id, name: (sort: "desc")]),
  @comment("Example model")
}

enum ExampleEnum {
  VALUE1,
  VALUE2,
  VALUE3
}`);

  const handleSubmit = async () => {
    if (!fmlCode.trim()) {
      message.error(t('enter_fml_code'));
      return;
    }

    const payload: ScriptImportPayload = {
      script: fmlCode,
      type: ScriptType.FML
    };

    onConfirm(payload);
  };

  const handleCancel = () => {
    onCancel();
  };

  React.useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: resetForm,
    cancel: handleCancel,
    getFieldsValue: () => ({fmlCode}),
    setFieldsValue: (values: any) => {
      if (values.fmlCode) {
        setFmlCode(values.fmlCode);
      }
    },
    validateFields: async () => {
      if (!fmlCode.trim()) {
        throw new Error(t('enter_fml_code'));
      }
      return {fmlCode};
    },
  }));

  return (
    <div style={{ height: '600px', border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius }}>
      <FmlEditor
        value={fmlCode}
        onChange={(value) => setFmlCode(value || '')}
        height="100%"
        showDocLink={true}
      />
    </div>
  );
};

export default FmlModelForm;
