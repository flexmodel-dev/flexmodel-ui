import {api} from "@/utils/request";
import type {Project, ProjectCreateRequest, ProjectUpdateRequest} from "@/types/project";

/**
 * 获取项目列表
 * @returns 项目列表
 */
export const getProjects = (): Promise<Project[]> => {
  return api.get("/projects?include=stats");
};

/**
 * 获取项目详情
 * @param projectId 项目ID
 * @returns 项目详情
 */
export const getProject = (projectId: string): Promise<Project> => {
  return api.get(`/projects/${projectId}`);
};

/**
 * 创建项目
 * @param data 项目信息
 * @returns 创建的项目信息
 */
export const createProject = (data: ProjectCreateRequest): Promise<Project> => {
  return api.post("/projects", data);
};

/**
 * 更新项目信息
 * @param projectId 项目ID
 * @param data 项目信息
 * @returns 更新后的项目信息
 */
export const updateProject = (projectId: string, data: ProjectUpdateRequest): Promise<Project> => {
  return api.put(`/projects/${projectId}`, data);
};

/**
 * 删除项目
 * @param projectId 项目ID
 */
export const deleteProject = (projectId: string): Promise<void> => {
  return api.delete(`/projects/${projectId}`);
};

/**
 * 获取项目统计信息
 * @param projectId 项目ID
 * @returns 项目统计信息
 */
export const getProjectStats = (projectId: string): Promise<{
  apiCount: number;
  modelCount: number;
  flowCount: number;
  dataSourceCount: number;
}> => {
  return api.get(`/projects/${projectId}/stats`);
};
