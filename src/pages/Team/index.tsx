import React, { useState } from "react";
import { Button, Form, Input, message, Modal, Space, Table, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import PageContainer from "@/components/common/PageContainer";
import type { ColumnsType } from "antd/es/table";

interface Member {
  id: string;
  username: string;
  createdAt: string;
}

const TeamManagement: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<Member[]>([
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

  const handleEdit = (team: Member) => {
    setEditingTeam(team);
    form.setFieldsValue(team);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t("team.member_delete_confirm"),
      content: t("team.member_delete_confirm_desc"),
      onOk: () => {
        setTeams(teams.filter(m => m.id !== id));
        message.success(t("team.member_delete_success"));
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeam) {
        setTeams(teams.map(m =>
          m.id === editingTeam.id ? { ...m, ...values } : m
        ));
        message.success(t("team.member_update_success"));
      } else {
        const newTeam: Member = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
        };
        setTeams([...teams, newTeam]);
        message.success(t("team.member_create_success"));
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

  const filteredTeams = teams.filter(team =>
    team.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns: ColumnsType<Member> = [
    {
      title: t("team.member_username"),
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username)
    },
    {
      title: t("team.member_created_at"),
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
        title={t("platform.team")}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t("team.member_add")}
          </Button>
        }
      >
        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Tabs>
            <Tabs.TabPane key="member" tab={t('team.member')}>
              <div style={{ marginBottom: 16 }}>
                <Input
                  placeholder={t("team.member_search_placeholder")}
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
            </Tabs.TabPane>
          </Tabs>
        </div>

      </PageContainer>

      <Modal
        title={editingTeam ? t("team.member_edit") : t("team.member_add")}
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
            label={t("team.member_username")}
            rules={[
              { required: true, message: t("team.member_username_required") },
              { min: 3, message: t("team.member_username_min_length") }
            ]}
          >
            <Input placeholder={t("team.member_username_placeholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TeamManagement;
