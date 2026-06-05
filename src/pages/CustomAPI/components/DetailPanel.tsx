import React from "react";
import { Badge, Card, Descriptions, Divider, Space, Table, Tag, Typography } from "antd";
import { ApiDefinition } from "@/types/api-management";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

interface SchemaTableRow {
  key: string;
  name: string;
  type: string;
  title: string;
  description: string;
  children?: SchemaTableRow[];
}

interface APIDetailProps {
  data: ApiDefinition | undefined;
}

// 解析JSON Schema为表格数据
const parseSchemaToTableData = (
  schema: Record<string, any>,
  parentKey: string = '',
  level: number = 0
): SchemaTableRow[] => {
  const rows: SchemaTableRow[] = [];

  if (!schema) return rows;

  const schemaType = schema.type || 'any';
  const schemaTitle = schema.title || '';
  const schemaDescription = schema.description || '';

  // 处理根对象
  if (level === 0 && schemaType === 'object' && schema.properties) {
    // 对于根级object，直接解析其properties
    Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
      rows.push(...parsePropertySchema(propName, propSchema, parentKey, level));
    });
  } else if (level === 0 && schemaType === 'array' && schema.items) {
    // 对于根级array，展示array信息及其items
    const key = parentKey || 'root';
    const row: SchemaTableRow = {
      key,
      name: parentKey || '[数组]',
      type: 'array',
      title: schemaTitle,
      description: schemaDescription,
    };

    // 解析items
    const itemsSchema = schema.items;
    const itemType = itemsSchema.type || 'any';

    if (itemType === 'object' && itemsSchema.properties) {
      row.children = [];
      Object.entries(itemsSchema.properties).forEach(([propName, propSchema]: [string, any]) => {
        row.children!.push(...parsePropertySchema(propName, propSchema, `${key}.items`, level + 1));
      });
    } else {
      row.children = [{
        key: `${key}.items`,
        name: '[元素]',
        type: itemType,
        title: itemsSchema.title || '',
        description: itemsSchema.description || '',
      }];
    }

    rows.push(row);
  } else {
    // 其他情况，创建单个行
    const key = parentKey || 'root';
    rows.push({
      key,
      name: parentKey || '[根]',
      type: schemaType,
      title: schemaTitle,
      description: schemaDescription,
    });
  }

  return rows;
};

// 解析单个属性的schema
const parsePropertySchema = (
  propName: string,
  propSchema: any,
  parentKey: string,
  level: number
): SchemaTableRow[] => {
  const key = parentKey ? `${parentKey}.${propName}` : propName;
  const propType = propSchema.type || 'any';
  const propTitle = propSchema.title || '';
  const propDescription = propSchema.description || '';

  const row: SchemaTableRow = {
    key,
    name: propName,
    type: propType,
    title: propTitle,
    description: propDescription,
  };

  // 处理object类型的嵌套属性
  if (propType === 'object' && propSchema.properties) {
    row.children = [];
    Object.entries(propSchema.properties).forEach(([childName, childSchema]: [string, any]) => {
      row.children!.push(...parsePropertySchema(childName, childSchema, key, level + 1));
    });
  }

  // 处理array类型的items
  if (propType === 'array' && propSchema.items) {
    row.children = [];
    const itemsSchema = propSchema.items;
    const itemType = itemsSchema.type || 'any';

    if (itemType === 'object' && itemsSchema.properties) {
      // array的元素是object，展示其properties
      Object.entries(itemsSchema.properties).forEach(([childName, childSchema]: [string, any]) => {
        row.children!.push(...parsePropertySchema(childName, childSchema, `${key}[*]`, level + 1));
      });
    } else {
      // array的元素是基本类型或其他类型
      row.children.push({
        key: `${key}[*]`,
        name: '[元素]',
        type: itemType,
        title: itemsSchema.title || '',
        description: itemsSchema.description || '',
      });
    }
  }

  return [row];
};

const DetailPanel: React.FC<APIDetailProps> = ({ data }: APIDetailProps) => {
  const { t } = useTranslation();

  if (!data) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full text-[#41454d] dark:text-[#6b6f78]">
          {t("api_detail.select_api_to_view")}
        </div>
      </Card>
    );
  }

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple'
    };
    return colors[method as keyof typeof colors] || 'default';
  };

  // 渲染Schema表格
  const renderSchemaTable = (schema: Record<string, any>) => {
    const tableData = parseSchemaToTableData(schema);

    const columns = [
      {
        title: t("api_detail.schema_field_name", { defaultValue: "属性名称" }),
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        render: (text: string) => <Text code>{text}</Text>,
      },
      {
        title: t("api_detail.schema_field_type", { defaultValue: "类型" }),
        dataIndex: 'type',
        key: 'type',
        width: '15%',
        render: (text: string) => {
          const typeColors: Record<string, string> = {
            string: 'green',
            number: 'blue',
            integer: 'blue',
            boolean: 'orange',
            object: 'purple',
            array: 'cyan',
          };
          return <Tag color={typeColors[text] || 'default'}>{text}</Tag>;
        },
      },
      {
        title: t("api_detail.schema_field_title", { defaultValue: "标题" }),
        dataIndex: 'title',
        key: 'title',
        width: '20%',
        render: (text: string) => text || <Text type="secondary">-</Text>,
      },
      {
        title: t("api_detail.schema_field_description", { defaultValue: "备注" }),
        dataIndex: 'description',
        key: 'description',
        width: '40%',
        render: (text: string) => text || <Text type="secondary">-</Text>,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        bordered
        defaultExpandAllRows
      />
    );
  };

  const isGraphQL = data?.meta?.execution?.executionType === 'graphql' || data?.meta?.execution?.executionType == null;
  const isScript = data?.meta?.execution?.executionType === 'script';

  const renderVariables = (variables: Record<string, any> | string | null | undefined) => {
    if (variables === null || variables === undefined) {
      return <Text type="secondary">{t("api_detail.none")}</Text>;
    }

    if (typeof variables === "string") {
      const trimmed = variables.trim();
      if (!trimmed) {
        return <Text type="secondary">{t("api_detail.none")}</Text>;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length === 0) {
          return <Text type="secondary">{t("api_detail.none")}</Text>;
        }
        return (
          <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md">
            <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        );
      } catch {
        return (
          <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md">
            <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
              {trimmed}
            </pre>
          </div>
        );
      }
    }

    if (Object.keys(variables).length === 0) {
      return <Text type="secondary">{t("api_detail.none")}</Text>;
    }

    return (
      <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md">
        <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
          {JSON.stringify(variables, null, 2)}
        </pre>
      </div>
    );
  };


  return (

    <Card
      className="h-full"
      style={{ height: 'calc(100vh - 180px)', overflow: 'scroll' }}
    >
      <div className="space-y-6">
        {/* API 基本信息 */}
        <div>
          <Title level={3} className="mb-4 text-[#181d26] dark:text-[#e0e2e6]">
            {data.name}
          </Title>

          <Descriptions bordered column={2} size="small">

            <Descriptions.Item label={t("api_detail.request_method")}>
              <Tag color={getMethodColor(data.method || '')}>{data.method}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.request_path")}>
              <Text code>{data.path}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.created_by")}>
              <Text>{data.createdBy || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.updated_by")}>
              <Text>{data.updatedBy || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.created_at")}>
              <Text>{data.createdAt || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.updated_at")}>
              <Text>{data.updatedAt || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.api_id")}>
              <Text code>{data.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("api_detail.status")}>
              <Badge
                status={data.enabled ? "success" : "error"}
                text={data.enabled ? t("api_detail.enabled") : t("api_detail.disabled")}
              />
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* 数据映射配置 */}
        {data.meta.document && (
          <>
            <Divider />
            <div>
              <Title level={4}
                className="mb-3 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.document", { defaultValue: "数据映射" })}</Title>

              <div className="space-y-6">
                {/* 入参映射 */}
                {data.meta.document.input && (
                  <div>
                    <Title level={5} className="mb-2 text-[#333840] dark:text-[#9297a0]">
                      {t("api_detail.document_input", { defaultValue: "入参映射" })}
                    </Title>
                    <div className="space-y-3 pl-4">
                      {data.meta.document.input.schema && (
                        <div>
                          <Text strong className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">
                            {t("api_detail.document_schema", { defaultValue: "Schema (JSON Schema)" })}:
                          </Text>
                          <div>
                            {renderSchemaTable(data.meta.document.input.schema)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 出参映射 */}
                {data.meta.document.output && (
                  <div>
                    <Title level={5} className="mb-2 text-[#333840] dark:text-[#9297a0]">
                      {t("api_detail.document_output", { defaultValue: "出参映射" })}
                    </Title>
                    <div className="space-y-3 pl-4">
                      {data.meta.document.output.schema && (
                        <div>
                          <Text strong className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">
                            {t("api_detail.document_schema", { defaultValue: "Schema (JSON Schema)" })}:
                          </Text>
                          <div>
                            {renderSchemaTable(data.meta.document.output.schema)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 子项信息 */}
        {data.children && data.children.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={4}
                className="mb-3 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.children")} ({data.children.length})</Title>
              <Space orientation="vertical" className="w-full">
                {data.children.map((child) => (
                  <Card key={child.id} size="small" className="bg-[#f8fafc] dark:bg-[#1d1f25]">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text strong className="text-[#181d26] dark:text-[#e0e2e6]">{child.name}</Text>
                        <div className="text-sm text-[#41454d] dark:text-[#6b6f78] mt-1">
                          <Tag color={getMethodColor(child.method || '')}>
                            {child.method}
                          </Tag>
                          <Text code className="ml-2">{child.path}</Text>
                        </div>
                      </div>
                      <Badge
                        status={child.enabled ? "success" : "error"}
                        text={child.enabled ? t("api_detail.enable") : t("api_detail.disable")}
                      />
                    </div>
                  </Card>
                ))}
              </Space>
            </div>
          </>
        )}

        {/* 认证与权限 */}
        <div>
          <Title level={4}
            className="mb-3 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.auth_and_permissions")}</Title>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label={t("api_detail.requires_auth")}>
              <Badge
                status={data.meta.auth ? "warning" : "success"}
                text={data.meta.auth ? t("api_detail.yes") : t("api_detail.no")}
              />
            </Descriptions.Item>
            {data.meta.identityProvider && (
              <Descriptions.Item label={t("api_detail.identity_provider")}>
                <Text>{data.meta.identityProvider}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label={t("api_detail.rate_limiting_enabled")}>
              <Badge
                status={data.meta.rateLimitingEnabled ? "warning" : "default"}
                text={data.meta.rateLimitingEnabled ? t("api_detail.yes") : t("api_detail.no")}
              />
            </Descriptions.Item>
            {data.meta.rateLimitingEnabled && (
              <>
                <Descriptions.Item label={t("api_detail.max_request_count")}>
                  <Text>{data.meta.maxRequestCount || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t("api_detail.interval_in_seconds")} span={2}>
                  <Text>{data.meta.intervalInSeconds || 'N/A'}</Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </div>

        {/* 执行配置 */}
        {data.meta.execution && (
          <>
            <Divider />
            <div>
              <Title level={4}
                className="mb-3 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.execution_config")}</Title>

              <div className="space-y-4">

                {data.meta.execution.preScript && (
                  <div>
                    <Text strong
                      className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.pre_script", { defaultValue: "前置脚本" })}:</Text>
                    <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md border border-[#dddddd] dark:border-[#32363a]">
                      <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
                        {data.meta.execution.preScript}
                      </pre>
                    </div>
                  </div>
                )}

                {isGraphQL && (<div>
                  {data.meta.execution.operationName && (
                    <div>
                      <Text strong
                        className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.operation_name")}:</Text>
                      <Text code>{data.meta.execution.operationName}</Text>
                    </div>
                  )}

                  <div>
                    <Text strong
                      className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.variables")}:</Text>
                    {renderVariables(data.meta.execution.variables || {})}
                  </div>

                  {data.meta.execution.headers && Object.keys(data.meta.execution.headers).length > 0 && (
                    <div>
                      <Text strong
                        className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.headers")}:</Text>
                      {renderVariables(data.meta.execution.headers)}
                    </div>
                  )}

                  {data.meta.execution.query && (
                    <div>
                      <Text strong
                        className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.query_statement")}:</Text>
                      <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md">
                        <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
                          {data.meta.execution.query}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>)}

                {isScript && (
                  <div>
                    <Text strong
                      className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("apis.execution.execution_script")}:</Text>
                    <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md">
                      <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
                        {data.meta.execution.executionScript}
                      </pre>
                    </div>
                  </div>)}

                {data.meta.execution.postScript && (
                  <div>
                    <Text strong
                      className="block mb-2 text-[#181d26] dark:text-[#e0e2e6]">{t("api_detail.post_script", { defaultValue: "后置脚本" })}:</Text>
                    <div className="bg-[#f8fafc] dark:bg-[#1d1f25] p-3 rounded-md border border-[#dddddd] dark:border-[#32363a]">
                      <pre className="text-sm text-[#333840] dark:text-[#9297a0] whitespace-pre-wrap">
                        {data.meta.execution.postScript}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default DetailPanel;
