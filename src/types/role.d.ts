export interface RoleRequest {
  id?: string;
  name: string;
  description?: string;
  resourceIds?: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  resources?: {
    id: string;
    name: string;
  }[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
