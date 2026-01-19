import React, { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import type { UserResponse } from "@/types/user";
import type { RoleResponse } from "@/types/role";

interface UserModalProps {
  visible: boolean;
  editingUser: UserResponse | null;
  roles: RoleResponse[];
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  editingUser,
  roles,
  onCancel,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingUser) {
        form.setFieldsValue({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          roleIds: editingUser.roles?.map(r => r.id) || []
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingUser, form]);

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
      title={editingUser ? t("member.user_edit") : t("member.user_add")}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t("save")}
      cancelText={t("cancel")}
      width={500}
    >
      <Form form={form} layout="vertical">
        {!editingUser && (
          <Form.Item
            name="id"
            label={t("member.user_id")}
            rules={[
              { required: true, message: t("member.user_id_required") }
            ]}
          >
            <Input placeholder={t("member.user_id_placeholder")} />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label={t("member.user_name")}
          rules={[
            { required: true, message: t("member.user_name_required") },
            { min: 2, message: t("member.user_name_min_length") }
          ]}
        >
          <Input placeholder={t("member.user_name_placeholder")} />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("member.user_email")}
          rules={[
            { required: false, message: t("member.user_email_required") },
            { type: "email", message: t("member.user_email_invalid") }
          ]}
        >
          <Input placeholder={t("member.user_email_placeholder")} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t("member.user_password")}
          rules={editingUser ? [] : [
            { required: true, message: t("member.user_password_required") },
            { min: 6, message: t("member.user_password_min_length") }
          ]}
        >
          <Input.Password
            placeholder={editingUser ? t("member.user_password_placeholder_optional") : t("member.user_password_placeholder")} />
        </Form.Item>
        <Form.Item
          name="roleIds"
          label={t("member.user_roles")}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t("member.user_roles_placeholder")}
            style={{ width: '100%' }}
            options={roles.map(role => ({
              label: role.name,
              value: role.id
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
