import React, {useMemo} from "react";
import {Checkbox, Empty, Form, Input, Spin, theme, Tooltip} from "antd";
import {useTranslation} from "react-i18next";
import {groupLevelPerms, modelLevelPerms, PERM_GROUPS, type PermGroup,} from "@/pages/Authentication/permissionScope";

interface UiGroup extends PermGroup {
  label: string;
}

interface PermissionPickerProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  groups: UiGroup[];
  models: string[];
  opLabel: (perm: string) => string;
  t: (key: string) => string;
  loadingModels?: boolean;
}

/**
 * 权限勾选控件：作为 Form.Item name="permissionScope" 的自定义受控控件。
 *
 * 布局：
 * - 顶层：响应式 CSS Grid，按卡片自动分列排布，高度参差的卡片顶部对齐。
 * - 非模型组卡片：操作项水平排布。
 * - 模型组卡片：严格列网格矩阵（模型列 + 各操作列），逐模型一行，列严格对齐。
 *
 * 控件始终在细粒度（individuals）层面操作：value 即 UI 已勾选的具体权限串。
 * 压缩为通配串（["*"] / ["data:*"] / ["data:Classes:*"]）由 ProvidersTab 保存时处理。
 * 不使用 <Checkbox.Group>，避免父子状态串扰；全部状态由 value 显式驱动。
 */
const PermissionPicker: React.FC<PermissionPickerProps> = ({
                                                             value = [],
                                                             onChange,
                                                             groups,
                                                             models,
                                                             opLabel,
                                                             t,
                                                             loadingModels,
                                                           }) => {
  const {token} = theme.useToken();

  const groupPerms = (g: PermGroup): string[] => {
    if (g.perModel) {
      return models.flatMap((m) => modelLevelPerms(g, m));
    }
    return groupLevelPerms(g);
  };

  const apply = (perms: string[], checked: boolean) => {
    const next = new Set(value);
    if (checked) {
      perms.forEach((p) => next.add(p));
    } else {
      perms.forEach((p) => next.delete(p));
    }
    onChange?.(Array.from(next));
  };

  const headerState = (perms: string[]) => {
    const count = perms.filter((p) => value.includes(p)).length;
    return {
      checked: perms.length > 0 && count === perms.length,
      indeterminate: count > 0 && count < perms.length,
    };
  };

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
    padding: "8px 12px",
    background: token.colorBgContainer,
  };

  return (
    <Spin spinning={!!loadingModels}>
      <div style={{width: "100%", display: "flex", flexDirection: "column", gap: 12}}>
        {groups.map((g) => {
          const perms = groupPerms(g);
          const hs = headerState(perms);
          return (
            <div key={g.key} style={cardStyle}>
              <Checkbox
                checked={hs.checked}
                indeterminate={hs.indeterminate}
                onChange={(e) => apply(perms, e.target.checked)}
              >
                <strong>{g.label}</strong>
              </Checkbox>
              <div style={{marginTop: 6}}>
                {!g.perModel ? (
                  <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                    {perms.map((p) => (
                      <Tooltip key={p} title={p}>
                        <Checkbox
                          checked={value.includes(p)}
                          onChange={(e) => apply([p], e.target.checked)}
                        >
                          {opLabel(p)}
                        </Checkbox>
                      </Tooltip>
                    ))}
                  </div>
                ) : models.length === 0 ? (
                  <div style={{paddingTop: 4}}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t("permission_no_models")}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: 240,
                      overflow: "auto",
                      paddingRight: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `minmax(96px, auto) repeat(${g.ops.length}, minmax(0, 1fr))`,
                        columnGap: 8,
                        rowGap: 6,
                        alignItems: "center",
                      }}
                    >
                      {models.flatMap((m) => {
                        const mp = modelLevelPerms(g, m);
                        const ms = headerState(mp);
                        return [
                          <div
                            key={`${m}-name`}
                            style={{display: "flex", alignItems: "center"}}
                          >
                            <Checkbox
                              checked={ms.checked}
                              indeterminate={ms.indeterminate}
                              onChange={(e) => apply(mp, e.target.checked)}
                            >
                              {m}
                            </Checkbox>
                          </div>,
                          ...mp.map((p) => (
                            <div
                              key={p}
                              style={{display: "flex", justifyContent: "center"}}
                            >
                              <Tooltip title={p}>
                                <Checkbox
                                  checked={value.includes(p)}
                                  onChange={(e) => apply([p], e.target.checked)}
                                />
                              </Tooltip>
                            </div>
                          )),
                        ];
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Spin>
  );
};

interface OidcFormProps {
  models: string[];
  loadingModels?: boolean;
}

const OidcForm: React.FC<OidcFormProps> = ({models, loadingModels}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const issuer = Form.useWatch?.("issuer");
  // "全部范围"开关。未配置时默认为全部范围（见 ProvidersTab 加载逻辑与下方 initialValue）。
  const permissionScopeAll = Form.useWatch?.("permissionScopeAll") ?? true;

  // 能力分组：结构来自共享定义 PERM_GROUPS，标签来自 i18n。
  const groups = useMemo<UiGroup[]>(
    () =>
      PERM_GROUPS.map((g) => ({
        ...g,
        label: t(`perm_group_${g.key}`),
      })),
    [t],
  );

  // 权限串末段（操作名）做本地化。
  const opLabel = (perm: string) => {
    const op = perm.split(":").pop();
    const map: Record<string, string> = {
      view: t("perm_op_view"),
      create: t("perm_op_create"),
      update: t("perm_op_update"),
      delete: t("perm_op_delete"),
      execute: t("perm_op_execute"),
    };
    return (op && map[op]) || op || perm;
  };

  return (
    <>
      <Form.Item
        label={t("oidc_issuer")}
        name="issuer"
        rules={[{ required: true, message: t("oidc_issuer_required") }]}
      >
        <Input placeholder="e.g. http://localhost:8080/realms/master" />
      </Form.Item>

      {issuer && (
        <Form.Item label={t("oidc_discovery_endpoint")}>
          <span style={{ wordBreak: "break-all", color: token.colorTextSecondary }}>
            {issuer}/.well-known/openid-configuration
          </span>
        </Form.Item>
      )}

      <Form.Item
        label={t("oidc_client_id")}
        name="clientId"
        rules={[{ required: true, message: t("oidc_client_id_required") }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={t("oidc_client_secret")}
        name="clientSecret"
        rules={[{ required: true, message: t("oidc_client_secret_required") }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label={t("permission_scope")}
        tooltip={t("permission_scope_hint") || undefined}
      >
        <Form.Item name="permissionScopeAll" valuePropName="checked" initialValue={true} noStyle>
          <Checkbox>{t("permission_scope_all")}</Checkbox>
        </Form.Item>
      </Form.Item>

      {!permissionScopeAll && (
        <Form.Item
          label={t("permission_scope")}
          name="permissionScope"
          rules={[{required: true, message: t("permission_scope_required")}]}
        >
          <PermissionPicker groups={groups} models={models} opLabel={opLabel} t={t} loadingModels={loadingModels}/>
        </Form.Item>
      )}
    </>
  );
};

export default OidcForm;
