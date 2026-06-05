import React from 'react';
import {Button, Input, Select} from 'antd';
import {CloseOutlined, PlusOutlined} from '@ant-design/icons';

const { Option } = Select;

interface FieldMapping {
  field: string;
  value: string;
}

interface FieldOption {
  name: string;
  type: string;
  comment?: string;
}

interface FieldMappingComponentProps {
  value?: FieldMapping[];
  onChange?: (value: FieldMapping[]) => void;
  placeholder?: {
    field?: string;
    value?: string;
  };
  disabled?: boolean;
  fieldOptions?: FieldOption[];
}

const FieldMappingComponent: React.FC<FieldMappingComponentProps> = ({
  value = [],
  onChange,
  placeholder = {
    field: '字段名',
    value: '字段值'
  },
  disabled = false,
  fieldOptions = []
}) => {
  const handleAdd = () => {
    const newMapping: FieldMapping = { field: '', value: '' };
    onChange?.([...value, newMapping]);
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange?.(newValue);
  };

  const handleFieldChange = (index: number, field: string) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], field };
    onChange?.(newValue);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedValue = [...value];
    updatedValue[index] = { ...updatedValue[index], value: newValue };
    onChange?.(updatedValue);
  };

  // 获取已选择的字段名列表
  const getSelectedFields = (currentIndex: number) => {
    return value
      .map((mapping, index) => index !== currentIndex ? mapping.field : null)
      .filter(field => field && field !== '');
  };

  return (
    <div>
      {value.map((mapping, index) => {
        const selectedFields = getSelectedFields(index);

        return (
          <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Select
              placeholder={placeholder.field}
              value={mapping.field || undefined}
              onChange={(fieldValue) => handleFieldChange(index, fieldValue)}
              disabled={disabled}
              style={{ flex: 1 }}
              showSearch
              allowClear
            >
              {fieldOptions.filter(f=>f.type!=='Relation').map(field => {
                const isSelected = selectedFields.includes(field.name);
                return (
                  <Option
                    key={field.name}
                    value={field.name}
                    disabled={isSelected}
                  >
                    {field.name}
                  </Option>
                );
              })}
            </Select>
            <span style={{ color: '#41454d' }}>=</span>
            <Input
              placeholder={placeholder.value}
              value={mapping.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              disabled={disabled}
              style={{ flex: 2 }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => handleRemove(index)}
              disabled={disabled}
              size="small"
              style={{ color: '#aa2d00' }}
            />
          </div>
        );
      })}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        disabled={disabled}
        style={{ width: '100%', marginTop: 8 }}
      >
        新增字段
      </Button>
    </div>
  );
};

export default FieldMappingComponent;
