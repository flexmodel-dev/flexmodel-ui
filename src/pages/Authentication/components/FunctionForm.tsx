import React, {useCallback, useEffect, useState} from "react";
import {Form, Select} from "antd";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";
import type {FunctionResponse} from "@/services/function";
import {getFunctionList} from "@/services/function";

const FunctionForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || "";

  const [functions, setFunctions] = useState<FunctionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFunctions = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const fnList = await getFunctionList(projectId, { size: 1000 });
      setFunctions(fnList.list);
    } catch {
      console.error("Failed to load functions");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  return (
    <Form.Item
      name="functionName"
      label={t("function")}
      tooltip={t("function_tooltip") || undefined}
      rules={[{ required: true, message: t("function_required") }]}
    >
      <Select
        loading={loading}
        placeholder={t("function_required")}
        options={functions.map((fn) => ({
          label: fn.name,
          value: fn.name,
        }))}
      />
    </Form.Item>
  );
};

export default FunctionForm;
