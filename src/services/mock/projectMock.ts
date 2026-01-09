import type {Project, ProjectCreateRequest, ProjectUpdateRequest} from "@/types/project";

const mockProjects: Project[] = [
  {
    id: 'project-001',
    name: '电商平台',
    description: '电商业务数据建模和API管理',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    ownerId: 'user-001',
    memberCount: 5,
    apiCount: 24,
    modelCount: 12,
    flowCount: 8
  },
  {
    id: 'project-002',
    name: 'CRM系统',
    description: '客户关系管理系统',
    status: 'active',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
    ownerId: 'user-001',
    memberCount: 3,
    apiCount: 18,
    modelCount: 8,
    flowCount: 5
  },
  {
    id: 'project-003',
    name: '数据分析平台',
    description: '大数据分析和可视化平台',
    status: 'inactive',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    ownerId: 'user-001',
    memberCount: 2,
    apiCount: 12,
    modelCount: 6,
    flowCount: 3
  },
  {
    id: 'project-004',
    name: '物联网管理系统',
    description: 'IoT设备监控和数据采集',
    status: 'active',
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-04-05T00:00:00Z',
    ownerId: 'user-001',
    memberCount: 4,
    apiCount: 32,
    modelCount: 15,
    flowCount: 10
  }
];

export const mockGetProjects = (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProjects);
    }, 300);
  });
};

export const mockGetProject = (projectId: string): Promise<Project> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        resolve(project);
      } else {
        reject(new Error('Project not found'));
      }
    }, 200);
  });
};

export const mockCreateProject = (data: ProjectCreateRequest): Promise<Project> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: data.name,
        description: data.description,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'user-001',
        memberCount: 1,
        apiCount: 0,
        modelCount: 0,
        flowCount: 0
      };
      mockProjects.push(newProject);
      resolve(newProject);
    }, 300);
  });
};

export const mockUpdateProject = (projectId: string, data: ProjectUpdateRequest): Promise<Project> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = mockProjects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = {
          ...mockProjects[projectIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
        mockProjects[projectIndex] = updatedProject;
        resolve(updatedProject);
      } else {
        reject(new Error('Project not found'));
      }
    }, 300);
  });
};

export const mockDeleteProject = (projectId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = mockProjects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        mockProjects.splice(projectIndex, 1);
        resolve();
      } else {
        reject(new Error('Project not found'));
      }
    }, 300);
  });
};

export const mockGetProjectStats = (projectId: string): Promise<{
  apiCount: number;
  modelCount: number;
  flowCount: number;
  dataSourceCount: number;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        resolve({
          apiCount: project.apiCount,
          modelCount: project.modelCount,
          flowCount: project.flowCount,
          dataSourceCount: Math.floor(Math.random() * 5) + 1
        });
      } else {
        reject(new Error('Project not found'));
      }
    }, 200);
  });
};
