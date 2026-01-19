import React from "react";
import { Button, Input, Space, Table } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import type { MemberResponse } from "@/types/member.d";

interface MemberListProps {
  members: MemberResponse[];
  loading: boolean;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onEdit: (member: MemberResponse) => void;
  onDelete: (id: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  loading,
  onSearch,
  onAdd,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

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
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            {t("edit")}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            {t("delete")}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Table
      title={() => (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Input
            placeholder={t("member.user_search_placeholder")}
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {t("member.user_add")}
          </Button>
        </Space>
      )}
      columns={columns}
      dataSource={members}
      rowKey="id"
      loading={loading}
      pagination={{
        total: members.length,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => t("pagination_total_text", {
          start: 1,
          end: Math.min(10, total),
          total
        })
      }}
    />
  );
};

export default MemberList;
