import React, {useEffect, useState} from "react";
import {Form, Input, Select, Switch} from "antd";
import {getModelList} from "@/services/model.ts";
import {useTranslation} from "react-i18next";
import DefaultValueInput from "./DefaultValueInput";
import {Field} from "@/types/data-modeling";
import {useProject} from "@/store/appStore";


interface FieldFormProps {
  mode: 'create' | 'edit';
  model: any;
  currentValue: any;
  onConfirm: (form: any) => void;
  onCancel: () => void;
}

export const BasicFieldTypes = [
  {
    name: 'String',
    label: 'String',
  },
  {
    name: 'Int',
    label: 'Int',
  },
  {
    name: 'Long',
    label: 'Long',
  },
  {
    name: 'Float',
    label: 'Float',
  },
  {
    name: 'Boolean',
    label: 'Boolean',
  },
  {
    name: 'DateTime',
    label: 'DateTime',
  },
  {
    name: 'Date',
    label: 'Date',
  },
  {
    name: 'Time',
    label: 'Time',
  },
  {
    name: 'JSON',
    label: 'JSON',
  },
];

export const FieldInitialValues: any = {
  STRING: {
    type: 'String',
    length: 255,
    unique: false,
    nullable: true,
    identity: false,
  },
  INT: {
    type: 'Int',
    unique: false,
    nullable: true,
    identity: false,
  },
  LONG: {
    type: 'Long',
    unique: false,
    nullable: true,
    identity: false,
  },
  DECIMAL: {
    type: 'Decimal',
    precision: 20,
    scale: 2,
    unique: false,
    nullable: true,
    identity: false,
  },
  BOOLEAN: {
    type: 'Boolean',
    unique: false,
    nullable: true,
    identity: false,
  },
  DATE: {
    type: 'Date',
    unique: false,
    nullable: true,
    identity: false,
  },
  TIME: {
    type: 'Time',
    unique: false,
    nullable: true,
    identity: false,
  },
  DATETIME: {
    type: 'DateTime',
    unique: false,
    nullable: true,
    identity: false,
  },
  JSON: {
    type: 'JSON',
    unique: false,
    nullable: true,
    identity: false,
  },
  RELATION: {
    type: 'Relation',
    multiple: true,
    localField: null,
    foreignField: null,
    unique: false,
    nullable: true,
    cascadeDelete: false,
    identity: false,
  },
  ENUM: {
    type: 'Enum',
    unique: false,
    nullable: true,
    multiple: false,
    identity: false,
  },
};

const FieldForm = React.forwardRef<any, FieldFormProps>(({
  mode,
  model,
  currentValue,
  onConfirm,
  onCancel,
}, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  React.useImperativeHandle(ref, () => ({
    submit: handleConfirm,
    reset: handleCancel,
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));
  const [modelList, setModelList] = useState<any[]>([]);
  const [RelationModel, setRelationModel] = useState<any>();
  const [tmpType, setTmpType] = useState<string>("");

  const reqModelList = React.useCallback(async () => {
    const data = await getModelList(projectId);
    console.log('ModelList data:', data);
    console.log('Enum models:', data.filter(item => item.type === "enum"));
    setModelList(data);
  }, [projectId]);

  const initialValues = React.useMemo(() => ({
    name: "",
    type: "String",
    concreteType: "String",
    unique: false,
    nullable: true,
    identity: false,
    comment: "",
    defaultValue: { type: "fixed", value: null },
    length: 255,
    precision: 20,
    scale: 2,
    multiple: false,
    localField: null,
    foreignField: null,
    cascadeDelete: false,
    from: "",
    tmpType: "String",
  }), []);

  useEffect(() => {
    reqModelList();
    if (currentValue && Object.keys(currentValue).length > 0) {
      form.setFieldsValue({
        ...initialValues,
        ...currentValue
      });
      let tmpTypeValue = currentValue.tmpType;
      if (!tmpTypeValue) {
        if (currentValue.type === 'Relation' && currentValue.from) {
          tmpTypeValue = `Relation:${currentValue.from}`;
        } else if (currentValue.type === 'Enum' && currentValue.from) {
          tmpTypeValue = `Enum:${currentValue.from}`;
        } else {
          tmpTypeValue = currentValue.type;
        }
      }
      setTmpType(tmpTypeValue);
    } else {
      form.setFieldsValue(initialValues);
      setTmpType("String");
    }
  }, [currentValue, form, initialValues, reqModelList]);

  useEffect(() => {
    if (tmpType?.startsWith("Relation:")) {
      const relatedModelName = tmpType.replace("Relation:", "");
      const relatedModel = modelList.find((m) => m.name === relatedModelName);
      setRelationModel(relatedModel);
    } else {
      setRelationModel(null);
    }
  }, [modelList, tmpType]);

  const handleTypeChange = (value: string) => {
    setTmpType(value);
    console.log("----");
    if (value.startsWith("Relation")) {
      form.setFieldsValue({
        ...FieldInitialValues["RELATION"],
        type: "Relation",
        from: value.replace("Relation:", ""),
        multiple: false,
        defaultValue: { type: "fixed", value: null },
      });
    } else if (value.startsWith("Enum")) {
      form.setFieldsValue({
        ...FieldInitialValues["ENUM"],
        type: "EnumRef",
        from: value.replace("Enum:", ""),
        defaultValue: { type: "fixed", value: null },
      })
    } else {
      form.setFieldsValue({
        ...FieldInitialValues[value.toUpperCase()],
        type: value,
        multiple: false,
        defaultValue: { type: "fixed", value: null },
      });
    }
  };

  const handleConfirm = () => {
    form.validateFields().then((values) => {
      if (values.defaultValue?.name === null && values.defaultValue?.value === null) {
        values.defaultValue = null;
      }
      console.log('FieldForm提交的数据:', values);
      console.log('identity字段值:', values.identity);
      onConfirm(values);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleFormChange = (
    changedValues: Partial<Field>,
    allValues: Field
  ) => {
    if ("multiple" in changedValues) {
      if (
        allValues.defaultValue !== undefined &&
        allValues.defaultValue !== null
      ) {
        if (changedValues.multiple) {
          const _defaultValue = Array.isArray(allValues.defaultValue)
            ? allValues.defaultValue
            : [allValues.defaultValue];

          form.setFieldsValue({
            defaultValue: _defaultValue,
          });
        } else {
          const _defaultValue = Array.isArray(allValues.defaultValue)
            ? allValues.defaultValue[0]
            : allValues.defaultValue;

          form.setFieldsValue({
            defaultValue: _defaultValue,
          });
        }
      }
    }

    if ("identity" in changedValues && changedValues.identity === true) {
      console.log("Field set as identity:", allValues.name);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleFormChange}
    >
      <Form.Item name="name" label={t("name")} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="comment" label={t("comment")}>
        <Input />
      </Form.Item>
      <Form.Item name="type" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="from" hidden>
        <Input />
      </Form.Item>
      <Form.Item
        label={t("type")}
        name="tmpType"
        rules={[{ required: true }]}
      >
        <Select
          onChange={handleTypeChange}
          disabled={mode === 'edit'}
        >
          <Select.OptGroup label={t("select_group_basic_field")}>
            {BasicFieldTypes.map((item) => (
              <Select.Option key={item.name} value={item.name}>
                {item.label}
              </Select.Option>
            ))}
          </Select.OptGroup>
          <Select.OptGroup label={t("select_group_relation")}>
            {modelList
              .filter((item) => item.type === "entity")
              .map((item) => (
                <Select.Option
                  key={item.name}
                  value={`Relation:${item.name}`}
                >
                  {item.name}
                </Select.Option>
              ))}
          </Select.OptGroup>
          <Select.OptGroup label={t("select_group_enumeration")}>
            {(() => {
              const enumModels = modelList.filter((item) => item.type === "enum");
              console.log('Enum models found:', enumModels.length, enumModels);
              return enumModels.map((item) => (
                <Select.Option key={item.name} value={`Enum:${item.name}`}>
                  {item.name}
                </Select.Option>
              ));
            })()}
          </Select.OptGroup>
        </Select>
      </Form.Item>

      {form.getFieldValue("tmpType") === "String" && (
        <Form.Item label={t("length")} name="length">
          <Input type="number" />
        </Form.Item>
      )}

      {form.getFieldValue("tmpType") === "Decimal" && (
        <>
          <Form.Item label={t("precision")} name="precision">
            <Input type="number" />
          </Form.Item>
          <Form.Item label={t("scale")} name="scale">
            <Input type="number" />
          </Form.Item>
        </>
      )}

      {form.getFieldValue("tmpType")?.startsWith("Relation") && (
        <>
          <Form.Item
            label={t("local_field")}
            name="localField"
            rules={[{ required: true }]}
          >
            <Select>
              {model?.fields?.map((field: any) => (
                <Select.Option key={field.name} value={field.name}>
                  {field.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t("foreign_field")}
            name="foreignField"
            rules={[{ required: true }]}
          >
            <Select>
              {RelationModel?.fields?.map((field: any) => (
                <Select.Option key={field.name} value={field.name}>
                  {field.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t("selection_multiple")}
            name="multiple"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={t("cascade_delete")}
            name="cascadeDelete"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}

      {form.getFieldValue("tmpType")?.startsWith("Enum") && (
        <>
          <Form.Item
            label={t("selection_multiple")}
            name="multiple"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}

      <Form.Item label={t("unique")} name="unique" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label={t("nullable")} name="nullable" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label={t("identity")} name="identity" valuePropName="checked">
        <Switch
          disabled={(() => {
            const currentFieldName = form.getFieldValue("name");
            const currentIdentity = form.getFieldValue("identity");

            if (currentIdentity) {
              return false;
            }

            const existingIdentityField = model?.fields?.find((field: any) =>
              field.identity === true && field.name !== currentFieldName
            );

            return !!existingIdentityField;
          })()}
        />
      </Form.Item>
      <Form.Item label={t("default_value")} name="defaultValue">
        <DefaultValueInput
          fieldFn={() => form.getFieldsValue()}
          value={form.getFieldValue("defaultValue")}
          onChange={(val) => form.setFieldsValue({ defaultValue: val })}
          modelList={modelList}
        />
      </Form.Item>
    </Form>
  );
});

export default FieldForm;
