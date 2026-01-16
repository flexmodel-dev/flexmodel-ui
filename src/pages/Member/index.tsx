import React, {useState, useEffect, useCallback} from "react";
import {Button, Form, Input, message, Modal, Space, Table} from "antd";
import {useTranslation} from "react-i18next";
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import PageContainer from "@/components/common/PageContainer";
import type {ColumnsType} from "antd/es/table";
import {getMembers, createMember, updateMember, deleteMember} from "@/services/member";
import type {MemberResponse} from "@/types/member.d";

const Member: React.FC = () => {
  const {t} = useTranslation();
  const [form] = Form.useForm();
  const [members, setTeams] = useState<MemberResponse[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<MemberResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      message.error(t("member.user_fetch_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = () => {
    setEditingTeam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (member: MemberResponse) => {
    setEditingTeam(member);
    form.setFieldsValue({
      id: member.id,
      name: member.name,
      email: member.email
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t("member.user_delete_confirm"),
      content: t("member.user_delete_confirm_desc"),
      onOk: async () => {
        try {
          await deleteMember(id);
          message.success(t("member.user_delete_success"));
          await fetchMembers();
        } catch (error) {
          console.error("Failed to delete member:", error);
          message.error(t("member.user_delete_failed"));
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeam) {
        await updateMember(editingTeam.id, {
          name: values.name,
          email: values.email,
          password: values.password
        });
        message.success(t("member.user_update_success"));
      } else {
        await createMember(values);
        message.success(t("member.user_create_success"));
      }
      setModalVisible(false);
      form.resetFields();
      await fetchMembers();
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  const filteredTeams = members.filter(member =>
    member.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    member.email.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns: ColumnsType<MemberResponse> = [
    {
      title: t("member.user_id"),
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id)
    },
    {
      title: t("member.user_name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: t("member.user_email"),
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: t("member.user_created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")
    },
    {
      title: t("operations"),
      key: "operations",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined/>}
            onClick={() => handleEdit(record)}
          >
            {t("edit")}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined/>}
            onClick={() => handleDelete(record.id)}
          >
            {t("delete")}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <PageContainer
        title={t("platform.member")}
        extra={[<Space>
          <Input
            placeholder={t("member.user_search_placeholder")}
            prefix={<SearchOutlined/>}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{width: 200}}
          />
          <Space>
            <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
              {t("member.user_add")}
            </Button>
          </Space>
        </Space>]}
        loading={loading}>
        <Table
          columns={columns}
          dataSource={filteredTeams}
          rowKey="id"
          pagination={{
            total: filteredTeams.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t("pagination_total_text", {
              start: 1,
              end: Math.min(10, total),
              total
            })
          }}
        />
      </PageContainer>
      <Modal
        title={editingTeam ? t("member.user_edit") : t("member.user_add")}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={t("save")}
        cancelText={t("cancel")}
        width={500}
      >
        <Form form={form} layout="vertical">
          {!editingTeam && (
            <Form.Item
              name="id"
              label={t("member.user_id")}
              rules={[
                {required: true, message: t("member.user_id_required")}
              ]}
            >
              <Input placeholder={t("member.user_id_placeholder")}/>
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label={t("member.user_name")}
            rules={[
              {required: true, message: t("member.user_name_required")},
              {min: 2, message: t("member.user_name_min_length")}
            ]}
          >
            <Input placeholder={t("member.user_name_placeholder")}/>
          </Form.Item>
          <Form.Item
            name="email"
            label={t("member.user_email")}
            rules={[
              {required: false, message: t("member.user_email_required")},
              {type: "email", message: t("member.user_email_invalid")}
            ]}
          >
            <Input placeholder={t("member.user_email_placeholder")}/>
          </Form.Item>
          <Form.Item
            name="password"
            label={t("member.user_password")}
            rules={editingTeam ? [] : [
              {required: true, message: t("member.user_password_required")},
              {min: 6, message: t("member.user_password_min_length")}
            ]}
          >
            <Input.Password
              placeholder={editingTeam ? t("member.user_password_placeholder_optional") : t("member.user_password_placeholder")}/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Member;
