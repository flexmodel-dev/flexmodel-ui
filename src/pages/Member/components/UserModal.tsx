import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import { useTranslation } from "react-i18next";
import type { UserResponse } from "@/types/user";

interface UserModalProps {
  visible: boolean;
  editingUser: UserResponse | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  editingUser,
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
          email: editingUser.email
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
      title={editingUser ? t("user.user_edit") : t("user.user_add")}
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
            label={t("user.user_id")}
            rules={[
              { required: true, message: t("user.user_id_required") }
            ]}
          >
            <Input placeholder={t("user.user_id_placeholder")} />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label={t("user.user_name")}
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
          label={t("user.user_password")}
          rules={editingUser ? [] : [
            { required: true, message: t("user.user_password_required") },
            { min: 6, message: t("user.user_password_min_length") }
          ]}
        >
          <Input.Password
            placeholder={editingUser ? t("user.user_password_placeholder_optional") : t("user.user_password_placeholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
