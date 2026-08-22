/**
 * 节点边框颜色工具函数
 * 优先级：校验失败 > 选中 > 默认
 */
export const getNodeBorderColor = (
  hasError: boolean,
  selected: boolean,
  colorError: string,
  colorPrimary: string,
  colorBorder: string
): string => {
  if (hasError) return colorError;
  if (selected) return colorPrimary;
  return colorBorder;
};

/**
 * 节点阴影样式工具函数
 */
export const getNodeBoxShadow = (
  hasError: boolean,
  selected: boolean,
  defaultShadow: string = '0 2px 8px rgba(15, 15, 15, 0.08)'
): string => {
  // Notion Analysis: error #e5484d, primary #0075de
  if (hasError) return '0 4px 12px rgba(229, 72, 77, 0.25)';
  if (selected) return '0 4px 12px rgba(0, 117, 222, 0.25)';
  return defaultShadow;
};
