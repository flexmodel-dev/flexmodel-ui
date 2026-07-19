import React from "react";
import {Checkbox, Empty, Spin, theme, Tooltip} from "antd";
import {groupLevelPerms, modelLevelPerms, type PermGroup} from "@/pages/Authentication/permissionScope";

export interface UiGroup extends PermGroup {
  label: string;
}

export interface PermissionPickerProps {
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
                                >
                                  {opLabel(p)}
                                </Checkbox>
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

export default PermissionPicker;
