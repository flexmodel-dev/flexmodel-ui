import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import { useTranslation } from "react-i18next";
import type { MemberResponse } from "@/types/member.d";

interface MemberModalProps {
  visible: boolean;
  editingMember: MemberResponse | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const MemberModal: React.FC<MemberModalProps> = ({
  visible,
  editingMember,
  onCancel,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingMember) {
        form.setFieldsValue({
          id: editingMember.id,
          name: editingMember.name,
          email: editingMember.email
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingMember, form]);

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
      title={editingMember ? t("member.user_edit") : t("member.user_add")}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t("save")}
      cancelText={t("cancel")}
      width={500}
    >
      <Form form={form} layout="vertical">
        {!editingMember && (
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
          rules={editingMember ? [] : [
            { required: true, message: t("member.user_password_required") },
            { min: 6, message: t("member.user_password_min_length") }
          ]}
        >
          <Input.Password
            placeholder={editingMember ? t("member.user_password_placeholder_optional") : t("member.user_password_placeholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberModal;
