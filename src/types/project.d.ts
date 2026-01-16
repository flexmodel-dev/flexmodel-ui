/**
 * 项目接口
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  ownerId?: string;
  stats?: {
    apiCount: number;
    modelCount: number;
    flowCount: number;
    datasourceCount: number;
    storageCount: number;
  };
}

/**
 * 项目创建请求接口
 */
export interface ProjectCreateRequest {
  id?: string;
  name: string;
  description?: string;
}

/**
 * 项目更新请求接口
 */
export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
}