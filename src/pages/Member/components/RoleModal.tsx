import React, { useEffect } from "react";
import { Form, Input, Modal, TreeSelect } from "antd";
import { useTranslation } from "react-i18next";
import type { RoleResponse } from "@/types/role.d";

interface RoleModalProps {
  visible: boolean;
  editingRole: RoleResponse | null;
  resourceTreeData: any[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  editingRole,
  resourceTreeData,
  onCancel,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingRole) {
        form.setFieldsValue({
          id: editingRole.id,
          name: editingRole.name,
          description: editingRole.description,
          resourceIds: editingRole.resources?.map(r => r.id) || []
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingRole, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={editingRole ? t("role.edit") : t("role.add")}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t("save")}
      cancelText={t("cancel")}
      width={500}
    >
      <Form form={form} layout="vertical">
        {!editingRole && (
          <Form.Item
            name="id"
            label={t("role.id")}
            rules={[
              { required: true, message: t("role.id_required") }
            ]}
          >
            <Input placeholder={t("role.id_placeholder")} />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label={t("role.name")}
          rules={[
            { required: true, message: t("role.name_required") }
          ]}
        >
          <Input placeholder={t("role.name_placeholder")} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("role.description")}
        >
          <Input.TextArea placeholder={t("role.description_placeholder")} rows={3} />
        </Form.Item>
        <Form.Item
          name="resourceIds"
          label={t("role.resources")}
        >
          <TreeSelect
            treeData={resourceTreeData}
            treeCheckable
            treeDefaultExpandAll
            showCheckedStrategy={TreeSelect.SHOW_PARENT}
            placeholder={t("role.resources_placeholder")}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
