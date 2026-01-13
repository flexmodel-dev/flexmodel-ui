export interface Project {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  apiCount: number;
  datasourceCount: number;
  flowCount: number;
  storageCount: number;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
}