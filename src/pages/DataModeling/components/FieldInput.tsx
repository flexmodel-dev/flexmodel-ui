import React from "react";
import {DatePicker, Input, InputNumber, Select, Switch, theme, TimePicker} from "antd";
import dayjs from "dayjs";
import {Field} from "@/types/data-modeling";

interface FieldInputProps {
  fieldFn: () => Field;
  editMode?: boolean;
  value: any;
  onChange: (val: any) => void;
  modelList?: any[];
}

const FieldInput: React.FC<FieldInputProps> = ({
                                                 fieldFn,
                                                 value,
                                                 onChange,
                                                 modelList = [],
                                               }) => {
  const {token} = theme.useToken();
  const field = fieldFn();

  // 紧凑主题样式
  const inputStyle = {
    fontSize: token.fontSizeSM,
  };

  const renderInput = () => {
    switch (field.type) {
      case "String":
        return (
          <Input
            placeholder={field.comment}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        );
      case "Float":
      case "Int":
      case "Long":
        return (
          <InputNumber
            placeholder={field.comment}
            value={value}
            onChange={(val) => onChange(val)}
            style={{width: "100%", ...inputStyle}}
          />
        );
      case "Boolean":
        return <Switch checked={value} onChange={(val) => onChange(val)}/>;
      case "Date":
        return (
          <DatePicker
            placeholder={field.comment}
            value={value ? dayjs(value) : null}
            onChange={(date) =>
              onChange(date ? date.format("YYYY-MM-DD") : null)
            }
            style={{width: "100%"}}
          />
        );
      case "Time":
        return (
          <TimePicker
            placeholder={field.comment}
            value={value ? dayjs(value, "HH:mm:ss") : null}
            onChange={(time) =>
              onChange(time ? time.format("HH:mm:ss") : null)
            }
            style={{width: "100%"}}
          />
        );
      case "DateTime":
        return (
          <DatePicker
            showTime
            placeholder={field.comment}
            value={value ? dayjs(value) : null}
            onChange={(date) =>
              onChange(date ? date.format("YYYY-MM-DD HH:mm:ss") : null)
            }
            style={{width: "100%"}}
          />
        );
      case "JSON":
        return (
          <Input.TextArea
            placeholder={field.comment}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        );
      case "EnumRef": {
        const fromEnum = modelList.find((m) => m.name === field.from);
        const commentByName = new Map<string, string>(
          (fromEnum?.elementDefinitions ?? [])
            .filter((element: any) => element?.comment)
            .map((element: any) => [element.name, element.comment])
        );
        return (
          <Select
            mode={field?.multiple ? "multiple" : undefined}
            style={{width: "100%"}}
            placeholder={field.comment}
            options={fromEnum?.elements?.map((val: any) => ({
              value: val,
              label: commentByName.get(val) || val,
            }))}
            value={value}
            onChange={(e) => onChange(e)}
          />
        );
      }
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        );
    }
  };

  return <>{renderInput()}</>;
};

export default FieldInput;

