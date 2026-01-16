import {api, BASE_URI} from '@/utils/request'

/**
 * 获取代码生成模板列表
 * @returns 模板列表
 */
export function getTemplates(): Promise<{ name: string, variables: object }[]> {
  return api.get('/codegen/templates');
}

/**
 * 获取文件为Blob对象
 * @param url 文件URL
 * @returns Blob对象
 */
export async function getFileAsBlob(url: string) {
  try {
    const response = await fetch(BASE_URI + url);

    if (!response.ok) {
      throw new Error(`网络响应不正常: ${response.status}`);
    }

    const blob = await response.blob();

    return blob;
  } catch (error) {
    console.error('获取文件失败:', error);
    throw error;
  }
}
