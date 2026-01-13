import React, { useState } from "react";
import { Button, Form, Input, message, Modal, Space, Table } from "antd";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import PageContainer from "@/components/common/PageContainer";
import type { ColumnsType } from "antd/es/table";

interface Member {
  id: string;
  username: string;
  createdAt: string;
}

const Member: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [members, setTeams] = useState<Member[]>([
    {
      id: "1",
      username: "admin",
      createdAt: "2024-01-01 10:00:00"
    },
    {
      id: "2",
      username: "developer",
      createdAt: "2024-01-15 14:30:00"
    },
    {
      id: "3",
      username: "tester",
      createdAt: "2024-02-01 09:15:00"
    },
    {
      id: "4",
      username: "viewer",
      createdAt: "2024-02-10 16:45:00"
    }
  ]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Member | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const handleAdd = () => {
    setEditingTeam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingTeam(member);
    form.setFieldsValue(member);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t("member.user_delete_confirm"),
      content: t("member.user_delete_confirm_desc"),
      onOk: () => {
        setTeams(members.filter(m => m.id !== id));
        message.success(t("member.user_delete_success"));
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeam) {
        setTeams(members.map(m =>
          m.id === editingTeam.id ? { ...m, ...values } : m
        ));
        message.success(t("member.user_update_success"));
      } else {
        const newTeam: Member = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
        };
        setTeams([...members, newTeam]);
        message.success(t("member.user_create_success"));
      }
      setModalVisible(false);
      form.resetFields();
    } catch {
      message.error(t("form_save_failed"));
    }
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  const filteredTeams = members.filter(member =>
    member.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns: ColumnsType<Member> = [
    {
      title: t("member.user_username"),
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username)
    },
    {
      title: t("member.user_created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt)
    },
    {
      title: t("operations"),
      key: "operations",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t("edit")}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
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
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>
            {t("member.user_add")}
          </Button>
        }
      >
        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder={t("member.user_search_placeholder")}
                  prefix={<SearchOutlined />}
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 300 }}
                />
              </div>
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
        </div>

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
          <Form.Item
            name="username"
            label={t("member.user_username")}
            rules={[
              { required: true, message: t("member.user_username_required") },
              { min: 3, message: t("member.user_username_min_length") }
            ]}
          >
            <Input placeholder={t("member.user_username_placeholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Member;
