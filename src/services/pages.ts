import {api} from "@/utils/request";

// ---- Types ----

export interface PageSiteResponse {
  id: string;
  projectId: string;
  customDomains: any;
  productionDeploymentId: string | null;
  status: string;
  fileCount: number;
  sizeBytes: number;
  errorMessage: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PageSiteUpdateRequest {
  customDomains?: any;
}

// ---- Page Site CRUD ----

export const getPageSite = (
  projectId: string,
): Promise<PageSiteResponse | null> => {
  return api.request<PageSiteResponse>({
    url: `/projects/${projectId}/page`,
    method: "get",
    validateStatus: (s) => s === 200 || s === 404,
  }).then((data) => {
    // validateStatus 让 404 不走错误拦截器
    // api.request 已经解包了 response.data，所以 data 就是响应体
    // 404 时后端无 body，data 为空字符串/undefined；200 时 data 是 PageSiteResponse
    return data && typeof data === "object" && "id" in data ? data : null;
  });
};

export const updatePageSite = (
  projectId: string,
  data: PageSiteUpdateRequest,
): Promise<PageSiteResponse> => {
  return api.put(`/projects/${projectId}/page`, data);
};

export const deployUpload = async (
  projectId: string,
  file: File,
): Promise<PageSiteResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  return api.request({
    url: `/projects/${projectId}/page/deployments`,
    method: "post",
    data: formData,
    headers: {"Content-Type": "multipart/form-data"},
  });
};

export const setProductionDeployment = (
  projectId: string,
  deploymentId: string,
): Promise<PageSiteResponse> => {
  return api.put(`/projects/${projectId}/page/production?deploymentId=${encodeURIComponent(deploymentId)}`);
};
