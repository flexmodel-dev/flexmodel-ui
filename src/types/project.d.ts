export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  memberCount: number;
  apiCount: number;
  modelCount: number;
  flowCount: number;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
}
