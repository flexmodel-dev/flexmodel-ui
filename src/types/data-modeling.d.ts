/**
 * 模型接口
 */
export interface Model extends TypeWrapper {
  fields: any[];
}

/**
 * 类型包装器接口
 */
export interface TypeWrapper {
  name: string;
  type: "entity" | "native_query" | "enum";
}

/**
 * 实体接口
 */
export interface Entity extends Model {
  indexes: any[];
  comment?: string;
}

/**
 * 枚举接口
 */
export interface Enum extends TypeWrapper {
  elements: string[];
  comment?: string;
}

/**
 * 原生查询模型接口
 */
export interface NativeQueryModel extends TypeWrapper {
  statement: string;
}

/**
 * 字段接口
 */
export interface Field extends Record<string, any> {
  name: string;
  type: string;
  concreteType: string;
  unique: boolean;
  nullable: boolean;
  comment?: string;
  multiple?: boolean;
  defaultValue?: DefaultValue;
  from?: string;
  tmpType?: string;
  identity?: boolean;
}

/**
 * 索引接口
 */
export interface Index {
  name: string;
  fields: { fieldName: string; direction: "ASC" | "DESC" }[];
  unique: boolean;
}

/**
 * 记录接口
 */
export interface MRecord {
  [key: string]: any;
}

/**
 * 记录列表属性接口
 */
export interface RecordListProps {
  datasource: string;
  model: any;
}

/**
 * 实体模式接口
 */
export interface EntitySchema {
  name: string;
  type: string;
  fields: TypedFieldSchema[];
  indexes: IndexSchema[];
  comment?: string;
  additionalProperties?: Record<string, any>;
  idl?: string;
}

/**
 * 枚举模式接口
 */
export interface EnumSchema {
  name: string;
  comment?: string;
  elements: string[];
  additionalProperties?: Record<string, any>;
  idl?: string;
  type: string;
}

/**
 * 原生查询模式接口
 */
export interface NativeQuerySchema {
  name: string;
  type: string;
  statement: string;
  comment?: string;
  additionalProperties?: Record<string, any>;
  idl?: string;
  parameters?: string[];
  fields?: QueryField[];
}

/**
 * 类型化字段模式接口
 */
export interface TypedFieldSchema {
  name: string;
  type: string;
  comment?: string;
  unique: boolean;
  nullable: boolean;
  defaultValue?: DefaultValue;
  additionalProperties?: Record<string, any>;
  modelName: string;
  identity?: boolean;
  concreteType?: string;
}

/**
 * 索引模式接口
 */
export interface IndexSchema {
  name: string;
  fields: Field[];
  unique: boolean;
  modelName: string;
}

/**
 * 字段接口
 */
export interface Field {
  fieldName: string;
  direction: Direction;
}

/**
 * 方向类型
 */
export type Direction = "ASC" | "DESC";

/**
 * 查询字段接口
 */
export interface QueryField {
  name: string;
  aliasName?: string;
  fieldName?: string;
}

/**
 * 默认值接口
 */
export interface DefaultValue {
  type: "generated" | "fixed";
  value: string | number | boolean | null;
  name: string | null;
}
