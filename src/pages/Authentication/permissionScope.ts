/**
 * OIDC Provider 权限范围（permissionScope）工具集。
 *
 * 权限串层级：
 *   - 全局：`*`（表示全部范围）
 *   - 能力组（非模型型，如 graphql/flow/scheduling/function/storage）：
 *       `${prefix}:${op}`，整组压缩为 `${prefix}:*`
 *   - 模型型组（modeling/data）：
 *       `${prefix}:${modelName}:${op}`，整组压缩为 `${prefix}:*`，
 *       单模型全操作压缩为 `${prefix}:${modelName}:*`
 *
 * 后端通过 wildcard 隐含匹配（见 PermissionHelper）：`*` 隐含所有；
 * `data:*` 隐含任意 `data:...`；`data:Classes:*` 隐含 `data:Classes:...`。
 * 因此 UI 无需为"全部范围"引入额外字段——后台存 `["*"]` 即可。
 */

export type PermOp = "view" | "create" | "update" | "delete" | "execute";

export interface PermGroup {
  /** 组标识（同权限串 prefix）。 */
  key: string;
  /** 是否按模型细分（true → 权限串三段 `${prefix}:${model}:${op}`）。 */
  perModel: boolean;
  /** 该组可用的操作集合。 */
  ops: PermOp[];
}

/**
 * 能力分组定义（与后端 @RequiresPermissions 使用的权限串前缀保持一致）。
 * 标签/i18n 由 UI 层叠加，这里只管结构与权限串生成。
 */
export const PERM_GROUPS: PermGroup[] = [
  {key: "graphql", perModel: false, ops: ["execute"]},
  {key: "modeling", perModel: true, ops: ["view", "create", "update", "delete"]},
  {key: "data", perModel: true, ops: ["view", "create", "update", "delete"]},
  {key: "flow", perModel: false, ops: ["view", "execute"]},
  {key: "scheduling", perModel: false, ops: ["view", "execute"]},
  {key: "function", perModel: false, ops: ["view", "execute"]},
  {key: "storage", perModel: false, ops: ["view", "create", "update", "delete"]},
];

/** 非模型型组的全部权限串。 */
export function groupLevelPerms(g: PermGroup): string[] {
  return g.ops.map((o) => `${g.key}:${o}`);
}

/** 模型型组的全部权限串（给定模型集合）。 */
export function modelLevelPerms(g: PermGroup, model: string): string[] {
  return g.ops.map((o) => `${g.key}:${model}:${o}`);
}

/** 某组在给定模型集合下的全部权限串。 */
export function groupAllPerms(g: PermGroup, models: string[]): string[] {
  if (g.perModel) {
    return models.flatMap((m) => modelLevelPerms(g, m));
  }
  return groupLevelPerms(g);
}

/** 所有组的全部权限串（用于判断"全部范围"）。 */
export function allPerms(models: string[]): string[] {
  return PERM_GROUPS.flatMap((g) => groupAllPerms(g, models));
}

/**
 * 判断给定 individuals 是否覆盖全部范围（等价于 `["*"]`）。
 */
export function isFullScope(individuals: string[], models: string[]): boolean {
  const expected = allPerms(models);
  if (expected.length === 0) return false;
  return expected.every((p) => individuals.includes(p));
}

/**
 * 把 individuals（细粒度权限串）压缩为后台存储格式：
 *   - 全部覆盖 → `["*"]`
 *   - 整组覆盖 → `${prefix}:*`
 *   - 整模型覆盖 → `${prefix}:${model}:*`
 *   - 其余 → 原始细粒度串
 *
 * @param individuals UI 勾选的细粒度权限串集合
 * @param models      当前项目模型集合（决定模型型组可展开的范围）
 */
export function compressPermissions(individuals: string[], models: string[]): string[] {
  const set = new Set(individuals);

  // 全部范围
  if (isFullScope(individuals, models)) {
    return ["*"];
  }

  const result: string[] = [];

  for (const g of PERM_GROUPS) {
    const all = groupAllPerms(g, models);

    // 整组已被全选 → 组级通配
    if (all.length > 0 && all.every((p) => set.has(p))) {
      result.push(`${g.key}:*`);
      // 移除已被组通配覆盖的项，避免重复
      all.forEach((p) => set.delete(p));
      continue;
    }

    if (g.perModel) {
      // 逐模型判断是否整模型全选
      for (const m of models) {
        const mp = modelLevelPerms(g, m);
        if (mp.every((p) => set.has(p))) {
          result.push(`${g.key}:${m}:*`);
          mp.forEach((p) => set.delete(p));
        }
      }
    }
  }

  // 剩余未覆盖项原样保留
  for (const p of individuals) {
    if (set.has(p)) {
      result.push(p);
    }
  }

  return result;
}

/**
 * 把后台存储格式展开为 UI 勾选所需的 individuals：
 *   - 含 `*` → 全部范围（返回所有权限串）
 *   - 含 `${prefix}:*` → 展开该组（模型型组需 models 才能展开）
 *   - 含 `${prefix}:${model}:*` → 展开该模型
 *   - 其余 → 原样保留
 *
 * 对于无法展开的通配串（如模型型组的 `${prefix}:*` 但 models 为空），
 * 视为全部范围，交由 picker 在无模型时显示空态。
 *
 * @param stored     后台 permissionScope 原始值
 * @param models     当前项目模型集合
 */
export function expandPermissions(
  stored: string[] | undefined | null,
  models: string[],
): string[] {
  if (!stored || stored.length === 0) {
    return [];
  }

  const arr = Array.isArray(stored) ? stored : [stored];
  const hasGlobal = arr.includes("*");

  // 任意全局通配 → 全部范围。即使含其它具体串也不影响，通配已隐含。
  if (hasGlobal) {
    return allPerms(models);
  }

  // 任意组级通配（含模型型组）→ 该组全部。模型型组无模型时无法展开，
  // 退化为"全部范围"以避免丢失授权语义。
  const expanded = new Set<string>();
  let needFallbackToFull = false;

  for (const raw of arr) {
    const s = String(raw).trim();
    if (!s) continue;

    const parts = s.split(":");

    // ── 三段通配 `${prefix}:${model}:*` ──
    if (parts.length === 3 && parts[2] === "*") {
      const [prefix, model] = parts;
      const g = PERM_GROUPS.find((it) => it.key === prefix && it.perModel);
      if (g && models.includes(model)) {
        modelLevelPerms(g, model).forEach((p) => expanded.add(p));
      } else {
        // 模型已不存在或 prefix 非模型型 → 原样保留（避免静默丢失）
        expanded.add(s);
      }
      continue;
    }

    // ── 两段通配 `${prefix}:*` ──
    if (parts.length === 2 && parts[1] === "*") {
      const prefix = parts[0];
      const g = PERM_GROUPS.find((it) => it.key === prefix);
      if (!g) {
        // 未知 prefix 的通配串，原样保留
        expanded.add(s);
        continue;
      }
      const all = groupAllPerms(g, models);
      if (all.length === 0) {
        // 模型型组但项目无模型 → 退化为全部范围
        needFallbackToFull = true;
      } else {
        all.forEach((p) => expanded.add(p));
      }
      continue;
    }

    // ── 普通权限串 ──
    expanded.add(s);
  }

  if (needFallbackToFull) {
    return allPerms(models);
  }
  return Array.from(expanded);
}
