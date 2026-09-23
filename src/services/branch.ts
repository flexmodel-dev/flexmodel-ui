import {BASE_URI, api} from "@/utils/request";
import type {Branch, BranchCreateRequest, BranchMergeRequest, BranchProgressEvent} from "@/types/branch";
import {useAuthStore} from "@/store/authStore";

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
export const createBranch = async (
  projectId: string,
  data: BranchCreateRequest,
  onProgress: (event: BranchProgressEvent) => void,
): Promise<Branch> => {
  return streamBranchOperation(`/projects/${projectId}/branches`, "POST", data, onProgress) as Promise<Branch>;
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
 * 合并分支
 * @param projectId 项目ID
 * @param data 合并请求
 * @param onProgress SSE 进度回调
 */
export const mergeBranch = async (
  projectId: string,
  data: BranchMergeRequest,
  onProgress: (event: BranchProgressEvent) => void,
): Promise<void> => {
  await streamBranchOperation(`/projects/${projectId}/branches/merge`, "POST", data, onProgress);
};

async function streamBranchOperation<T>(
  url: string,
  method: "POST",
  data: unknown,
  onProgress: (event: BranchProgressEvent) => void,
): Promise<T> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${BASE_URI}${url}`, {
    method,
    credentials: "include",
    headers: {
      ...(data ? {"Content-Type": "application/json"} : {}),
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error?.message || errorMessage;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!response.body || !contentType.includes("text/event-stream")) {
    throw new Error("Branch operation response is not an SSE stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: T | undefined;
  let failureMessage: string | undefined;

  const consumeChunk = (chunk: string) => {
    const dataLines = chunk
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());
    if (dataLines.length === 0) return;

    try {
      const event = JSON.parse(dataLines.join("\n")) as BranchProgressEvent;
      onProgress(event);
      if (event.type === "COMPLETED") {
        result = event.result as T;
      }
      if (event.type === "FAILED") {
        failureMessage = event.message || "Branch operation failed";
      }
    } catch {
      // Ignore malformed SSE comments and keep reading the stream.
    }
  };

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, {stream: true});
    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() || "";
    chunks.forEach(consumeChunk);
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    consumeChunk(buffer);
  }

  if (failureMessage) {
    throw new Error(failureMessage);
  }
  return result as T;
}
