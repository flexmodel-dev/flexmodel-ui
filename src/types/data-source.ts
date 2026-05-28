export type Db = { name: string; icon: any; }; 

export interface DatasourceSchema {
  name: string;
  type: DatasourceType;
  config: any; // 根据具体配置细化，如 { dbKind: string; url?: string; username?: string; password?: string; }
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DatasourceType = 'SYSTEM' | 'USER'; 

/**
 * 导入模型脚本类型枚举
 */
export enum ScriptType {
  JSON = 'JSON',
  FML = 'FML',
}

/**
 * 导入模型脚本表单类型
 */
export type ScriptImportForm = {
  script: string;
  type: ScriptType;
};

/**
 * 导入模型 API payload 类型
 */
export type ScriptImportPayload = ScriptImportForm; 