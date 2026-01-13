import {api} from "@/utils/request";
import type {Project, ProjectCreateRequest, ProjectUpdateRequest} from "@/types/project";

export const getProjects = (): Promise<Project[]> => {
  return api.get("/projects?include=stats");
};

export const getProject = (projectId: string): Promise<Project> => {
  return api.get(`/projects/${projectId}`);
};

export const createProject = (data: ProjectCreateRequest): Promise<Project> => {
  return api.post("/projects", data);
};

export const updateProject = (projectId: string, data: ProjectUpdateRequest): Promise<Project> => {
  return api.put(`/projects/${projectId}`, data);
};

export const deleteProject = (projectId: string): Promise<void> => {
  return api.delete(`/projects/${projectId}`);
};

export const getProjectStats = (projectId: string): Promise<{
  apiCount: number;
  modelCount: number;
  flowCount: number;
  dataSourceCount: number;
}> => {
  return api.get(`/projects/${projectId}/stats`);
};
