import React, { useState, useEffect, useCallback } from "react";
import { message, Modal, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import PageContainer from "@/components/common/PageContainer";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/user";
import { getRoles, createRole, updateRole, deleteRole } from "@/services/role";
import { getResourceTree } from "@/services/resource";
import type { UserResponse } from "@/types/user";
import type { RoleResponse } from "@/types/role";
import type { ResourceNode } from "@/types/resource.d";
import UserList from "./components/UserList";
import RoleList from "./components/RoleList";
import UserModal from "./components/UserModal";
import RoleModal from "./components/RoleModal";

const Member: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [roleSearchKeyword, setRoleSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [resourceTreeData, setResourceTreeData] = useState<any[]>([]);

  const activeTab = searchParams.get('tab') || 'users';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error(t("member.user_fetch_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchRoles = useCallback(async () => {
    setRoleLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      message.error(t("role.fetch_failed"));
    } finally {
      setRoleLoading(false);
    }
  }, [t]);

  const fetchResources = useCallback(async () => {
    try {
      const data = await getResourceTree();
      const treeData = transformResourceToTree(data);
      setResourceTreeData(treeData);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      message.error(t("resource.fetch_failed"));
    }
  }, [t]);

  const transformResourceToTree = (resources: ResourceNode[]): any[] => {
    return resources.map(resource => ({
      label: resource.name,
      value: resource.id,
      children: resource.children ? transformResourceToTree(resource.children) : undefined
    }));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchResources();
  }, [fetchUsers, fetchRoles, fetchResources]);

  const handleUserAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleUserEdit = (user: UserResponse) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleUserDelete = (id: string) => {
    Modal.confirm({
      title: t("member.user_delete_confirm"),
      content: t("member.user_delete_confirm_desc"),
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success(t("member.user_delete_success"));
          await fetchUsers();
        } catch (error) {
          console.error("Failed to delete user:", error);
          message.error(t("member.user_delete_failed"));
        }
      }
    });
  };

  const handleUserSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: values.name,
          email: values.email,
          password: values.password,
          roleIds: values.roleIds
        });
        message.success(t("member.user_update_success"));
      } else {
        await createUser(values);
        message.success(t("member.user_create_success"));
      }
      setModalVisible(false);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleRoleAdd = () => {
    setEditingRole(null);
    setRoleModalVisible(true);
  };

  const handleRoleEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setRoleModalVisible(true);
  };

  const handleRoleDelete = (id: string) => {
    Modal.confirm({
      title: t("role.delete_confirm"),
      content: t("role.delete_confirm_desc"),
      onOk: async () => {
        try {
          await deleteRole(id);
          message.success(t("role.delete_success"));
          await fetchRoles();
        } catch (error) {
          console.error("Failed to delete role:", error);
          message.error(t("role.delete_failed"));
        }
      }
    });
  };

  const handleRoleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: values.name,
          description: values.description,
          resourceIds: values.resourceIds
        });
        message.success(t("role.update_success"));
      } else {
        await createRole(values);
        message.success(t("role.create_success"));
      }
      setRoleModalVisible(false);
      await fetchRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleMemberSearch = (value: string) => {
    setSearchKeyword(value);
  };

  const handleRoleSearch = (value: string) => {
    setRoleSearchKeyword(value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    user.email.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(roleSearchKeyword.toLowerCase()) ||
    (role.description || "").toLowerCase().includes(roleSearchKeyword.toLowerCase())
  );

  return (
    <>
      <PageContainer
        title={t("platform.member")}
        loading={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
        >
          <Tabs.TabPane key="users" tab={t("member.user")}>
            <UserList
              users={filteredUsers}
              loading={loading}
              onSearch={handleMemberSearch}
              onAdd={handleUserAdd}
              onEdit={handleUserEdit}
              onDelete={handleUserDelete}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="roles" tab={t("platform.role")}>
            <RoleList
              roles={filteredRoles}
              loading={roleLoading}
              onSearch={handleRoleSearch}
              onAdd={handleRoleAdd}
              onEdit={handleRoleEdit}
              onDelete={handleRoleDelete}
            />
          </Tabs.TabPane>
        </Tabs>
      </PageContainer>
      <UserModal
        visible={modalVisible}
        editingUser={editingUser}
        roles={roles}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleUserSubmit}
      />
      <RoleModal
        visible={roleModalVisible}
        editingRole={editingRole}
        resourceTreeData={resourceTreeData}
        onCancel={() => setRoleModalVisible(false)}
        onSubmit={handleRoleSubmit}
      />
    </>
  );
};

export default Member;
