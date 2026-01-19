import React, { useState, useEffect, useCallback } from "react";
import { message, Modal, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/common/PageContainer";
import { getMembers, createMember, updateMember, deleteMember } from "@/services/member";
import { getRoles, createRole, updateRole, deleteRole } from "@/services/role";
import { getResourceTree } from "@/services/resource";
import type { MemberResponse } from "@/types/member.d";
import type { RoleResponse } from "@/types/role.d";
import type { ResourceNode } from "@/types/resource.d";
import MemberList from "./components/MemberList";
import RoleList from "./components/RoleList";
import MemberModal from "./components/MemberModal";
import RoleModal from "./components/RoleModal";

const Member: React.FC = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberResponse | null>(null);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [roleSearchKeyword, setRoleSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [resourceTreeData, setResourceTreeData] = useState<any[]>([]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
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
    fetchMembers();
    fetchRoles();
    fetchResources();
  }, [fetchMembers, fetchRoles, fetchResources]);

  const handleMemberAdd = () => {
    setEditingMember(null);
    setModalVisible(true);
  };

  const handleMemberEdit = (member: MemberResponse) => {
    setEditingMember(member);
    setModalVisible(true);
  };

  const handleMemberDelete = (id: string) => {
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

  const handleMemberSubmit = async (values: any) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
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
      await fetchMembers();
    } catch (error) {
      console.error("Failed to save member:", error);
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

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    member.email.toLowerCase().includes(searchKeyword.toLowerCase())
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
        <Tabs>
          <Tabs.TabPane key="members" tab={t("platform.member")}>
            <MemberList
              members={filteredMembers}
              loading={loading}
              onSearch={handleMemberSearch}
              onAdd={handleMemberAdd}
              onEdit={handleMemberEdit}
              onDelete={handleMemberDelete}
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
      <MemberModal
        visible={modalVisible}
        editingMember={editingMember}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleMemberSubmit}
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
