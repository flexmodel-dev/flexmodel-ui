import React from 'react';
import {Form} from 'antd';
import type {StorageSchema} from "@/types/storage";
import StorageForm from "@/pages/Storage/components/StorageForm";

interface StorageViewProps {
  data: StorageSchema;
}

const StorageView: React.FC<StorageViewProps> = ({ data }) => {
  return (
    <Form
      layout="vertical"
      variant="borderless"
      initialValues={data}
      key={`${data.name}-view`}
    >
      <StorageForm readOnly />
    </Form>
  );
};

export default StorageView;
