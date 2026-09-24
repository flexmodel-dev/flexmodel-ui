import React, {useEffect, useMemo, useState} from "react";
import {Form, Input, Select, Switch} from "antd";
import {getModelList} from "@/services/model.ts";
import {useTranslation} from "react-i18next";
import DefaultValueInput from "./DefaultValueInput";
import {Field, RelationStrategy} from "@/types/data-modeling";
import {useProject} from "@/store/appStore";
import {BasicFieldTypes, FieldInitialValues} from "./fieldFormConstants";


interface FieldFormProps {
  mode: 'create' | 'edit';
  model: any;
  currentValue: any;
  onConfirm: (form: any) => void;
  onCancel: () => void;
}

const FieldForm = ({
  mode,
  model,
  currentValue,
  onConfirm,
  onCancel,
                     ref,
                   }: FieldFormProps & { ref?: React.Ref<any> }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  const [modelList, setModelList] = useState<any[]>([]);
  const [tmpType, setTmpType] = useState<string>("");
  const relationStrategy = (Form.useWatch("strategy", form) ?? "FOREIGN_KEY") as RelationStrategy;
  const relationFilterText = Form.useWatch("filterText", form) ?? "";

  const reqModelList = React.useCallback(async () => {
    const data = await getModelList(projectId);
    console.log('ModelList data:', data);
    console.log('Enum models:', data.filter(item => item.type === "Enum"));
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
    text: false,
    precision: 20,
    scale: 2,
    multiple: false,
    localField: null,
    foreignField: null,
    strategy: "FOREIGN_KEY",
    filterText: "",
    cascadeDelete: false,
    from: "",
    tmpType: "String",
  }), []);

  useEffect(() => {
    reqModelList();
    if (currentValue && Object.keys(currentValue).length > 0) {
      const initialStrategy: RelationStrategy = currentValue.strategy
        ?? (currentValue.filter && !currentValue.localField && !currentValue.foreignField
          ? "CONDITION"
          : "FOREIGN_KEY");
      form.setFieldsValue({
        ...initialValues,
        ...currentValue,
        strategy: initialStrategy,
        filterText: currentValue.filter ? JSON.stringify(currentValue.filter, null, 2) : ""
      });
      let tmpTypeValue = currentValue.tmpType;
      if (!tmpTypeValue) {
        if (currentValue.type === 'ModelRef' && currentValue.from) {
          tmpTypeValue = `ModelRef:${currentValue.from}`;
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

  const modelRefModel = useMemo(() => {
    if (tmpType?.startsWith("ModelRef:")) {
      const relatedModelName = tmpType.replace("ModelRef:", "");
      return modelList.find((m) => m.name === relatedModelName);
    }
    return null;
  }, [modelList, tmpType]);

  const handleTypeChange = (value: string) => {
    setTmpType(value);
    console.log("----");
    if (value.startsWith("ModelRef")) {
      form.setFieldsValue({
        ...FieldInitialValues["MODEL_REF"],
        type: "ModelRef",
        from: value.replace("ModelRef:", ""),
        multiple: false,
        text: false,
        defaultValue: { type: "fixed", value: null },
      });
    } else if (value.startsWith("Enum")) {
      form.setFieldsValue({
        ...FieldInitialValues["ENUM"],
        type: "EnumRef",
        from: value.replace("Enum:", ""),
        text: false,
        defaultValue: { type: "fixed", value: null },
      })
    } else {
      form.setFieldsValue({
        ...FieldInitialValues[value.toUpperCase()],
        type: value,
        multiple: false,
        text: false,
        defaultValue: { type: "fixed", value: null },
      });
    }
  };

  const handleStrategyChange = (value: RelationStrategy) => {
    if (value === "CONDITION") {
      form.setFieldsValue({
        localField: null,
        foreignField: null,
        cascadeDelete: false
      });
    }
  };

  const parseRelationFilter = (filterText: string) => {
    const trimmedFilter = filterText?.trim();
    if (!trimmedFilter) {
      return null;
    }
    const parsedFilter = JSON.parse(trimmedFilter);
    if (Object.prototype.toString.call(parsedFilter) !== "[object Object]") {
      throw new Error("invalid filter");
    }
    return parsedFilter as Record<string, unknown>;
  };

  const handleConfirm = () => {
    form.validateFields().then((values) => {
      if (values.defaultValue?.name === null && values.defaultValue?.value === null) {
        values.defaultValue = null;
      }
      console.log('FieldForm提交的数据:', values);
      console.log('identity字段值:', values.identity);
      const submittedValues = {
        ...values,
        filter: parseRelationFilter(values.filterText)
      };
      delete submittedValues.filterText;
      if (submittedValues.strategy === "CONDITION") {
        delete submittedValues.localField;
        delete submittedValues.foreignField;
        delete submittedValues.cascadeDelete;
      }
      onConfirm(submittedValues);
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

    if (
      "filterText" in changedValues &&
      typeof changedValues.filterText === "string" &&
      changedValues.filterText.trim() !== "" &&
      allValues.strategy === "FOREIGN_KEY" &&
      allValues.cascadeDelete === true
    ) {
      form.setFieldsValue({cascadeDelete: false});
    }

    if (
      "cascadeDelete" in changedValues &&
      changedValues.cascadeDelete === true &&
      typeof allValues.filterText === "string" &&
      allValues.filterText.trim() !== ""
    ) {
      form.setFieldsValue({cascadeDelete: false});
    }
  };

  React.useImperativeHandle(ref, () => ({
    submit: handleConfirm,
    reset: handleCancel,
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    validateFields: form.validateFields,
  }));

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
              .filter((item) => item.type === "Entity")
              .map((item) => (
                <Select.Option
                  key={item.name}
                  value={`ModelRef:${item.name}`}
                >
                  {item.name}
                </Select.Option>
              ))}
          </Select.OptGroup>
          <Select.OptGroup label={t("select_group_enumeration")}>
            {(() => {
              const enumModels = modelList.filter((item) => item.type === "Enum");
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
        <>
          <Form.Item label={t("length")} name="length">
            <Input type="number"/>
          </Form.Item>
          <Form.Item label={t("text")} name="text" valuePropName="checked">
            <Switch/>
          </Form.Item>
        </>
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

      {form.getFieldValue("tmpType")?.startsWith("ModelRef") && (
        <>
          <Form.Item
            label={t("relation_strategy")}
            name="strategy"
            rules={[{required: true}]}
          >
            <Select onChange={handleStrategyChange}>
              <Select.Option value="FOREIGN_KEY">{t("key_relation")}</Select.Option>
              <Select.Option value="CONDITION">{t("condition_relation")}</Select.Option>
            </Select>
          </Form.Item>
          {relationStrategy === "FOREIGN_KEY" && (
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
              {modelRefModel?.fields?.map((field: any) => (
                  <Select.Option key={field.name} value={field.name}>
                  {field.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            </>
          )}
          {relationStrategy === "FOREIGN_KEY" ? (
            <>
              <Form.Item
                label={t("cascade_delete")}
                name="cascadeDelete"
                valuePropName="checked"
              >
                <Switch disabled={relationFilterText.trim() !== ""}/>
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            label={t("relation_filter")}
            name="filterText"
            extra={t("relation_filter_help")}
            rules={[
              {
                validator: (_, value: string) => {
                  const strategy = form.getFieldValue("strategy") as RelationStrategy;
                  const filterText = value?.trim() ?? "";
                  if (!filterText) {
                    return strategy === "CONDITION"
                      ? Promise.reject(new Error(t("relation_filter_required")))
                      : Promise.resolve();
                  }
                  try {
                    parseRelationFilter(filterText);
                  } catch {
                    return Promise.reject(new Error(t("relation_filter_invalid")));
                  }
                  if (
                    strategy === "FOREIGN_KEY" &&
                    form.getFieldValue("cascadeDelete") === true
                  ) {
                    return Promise.reject(new Error(t("relation_filter_cascade_conflict")));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={t("relation_filter_placeholder")}
            />
          </Form.Item>
          <Form.Item
            label={t("selection_multiple")}
            name="multiple"
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
};

export default FieldForm;
