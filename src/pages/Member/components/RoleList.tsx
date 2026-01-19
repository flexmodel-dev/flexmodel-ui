import React from "react";
import { Button, Input, Space, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import type { RoleResponse } from "@/types/role.d";

interface RoleListProps {
  roles: RoleResponse[];
  loading: boolean;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onEdit: (role: RoleResponse) => void;
  onDelete: (id: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  loading,
  onSearch,
  onAdd,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<RoleResponse> = [
    {
      title: t("role.id"),
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id)
    },
    {
      title: t("role.name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: t("role.description"),
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => (a.description || "").localeCompare(b.description || "")
    },
    {
      title: t("role.resources"),
      dataIndex: "resources",
      key: "resources",
      render: (resources: { id: string; name: string }[]) => (
        <Space>
          {resources?.map((resource) => (
            <Tag color="blue" key={resource.id}>{resource.name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: t("role.created_at"),
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
      columns={columns}
      dataSource={roles}
      rowKey="id"
      loading={loading}
      pagination={{
        total: roles.length,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => t("pagination_total_text", {
          start: 1,
          end: Math.min(10, total),
          total
        })
      }}
      title={() => (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Input
            placeholder={t("role.search_placeholder")}
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {t("role.add")}
          </Button>
        </Space>
      )}
    />
  );
};

export default RoleList;
