import { api } from "@/utils/request";
import type { Branch, BranchCreateRequest } from "@/types/branch";
import type { Project } from "@/types/project";

/**
 * 获取项目分支列表
 * @param projectId 项目ID
 * @returns 分支列表
 */
export const getBranches = (projectId: string): Promise<Branch[]> => {
  return api.get(`/projects/${projectId}/branches`);
};

/**
 * 创建分支
 * @param projectId 项目ID
 * @param data 分支创建请求
 * @returns 创建的分支
 */
export const createBranch = (projectId: string, data: BranchCreateRequest): Promise<Branch> => {
  return api.post(`/projects/${projectId}/branches`, data);
};

/**
 * 删除分支
 * @param projectId 项目ID
 * @param branchName 分支名称
 */
export const deleteBranch = (projectId: string, branchName: string): Promise<void> => {
  return api.delete(`/projects/${projectId}/branches/${branchName}`);
};

/**
 * 切换到指定分支
 * @param projectId 项目ID
 * @param branchName 分支名称
 * @returns 更新后的项目
 */
export const switchBranch = (projectId: string, branchName: string): Promise<Project> => {
  return api.put(`/projects/${projectId}/branches/${branchName}/switch`);
};
