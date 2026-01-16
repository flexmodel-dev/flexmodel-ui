export type Db = { name: string; icon: any; }; 

/**
 * 数据源配置接口
 */
export interface DatasourceSchema {
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DatasourceType = 'SYSTEM' | 'USER'; 

/**
 * 导入模型脚本类型枚举
 */
export type ScriptType = 'JSON' | 'IDL';

/**
 * 导入模型脚本表单类型
 */
export type ScriptImportForm = {
  script: string;
  type: ScriptType;
};

/**
 * 脚本导入负载接口
 */
export interface ScriptImportPayload {
  script: string;
  variables?: Record<string, any>;
} 