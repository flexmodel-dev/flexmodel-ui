/**
 * Convert ModelTree[] (grouped model data) to antd Tree DataNode[] format.
 * Used by ModelExplorer to replace the custom Tree component with antd Tree.
 */

export interface ModelTree {
  name: string;
  children?: ModelTree[];
  key?: string;
  type?: string;
  data?: any;
  isLeaf?: boolean;
}

export interface AntdTreeNode {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: AntdTreeNode[];
  icon?: React.ReactNode;
  /** Original model data (for entity/enum/native_query file nodes) */
  _data?: any;
  /** Model type: 'entity' | 'enum' | 'native_query' */
  _modelType?: string;
  /** Original path from TreeItem */
  _path?: string;
}

/**
 * Convert grouped model tree data to antd Tree DataNode array.
 *
 * Input: ModelTree[] from groupByType()
 *   [{ key: '__entity_group', name: '实体', children: [{ name: 'User', data: {...}, type: 'entity' }] }]
 *
 * Output: AntdTreeNode[]
 *   [{ key: '__entity_group', title: '实体', isLeaf: false,
 *      children: [{ key: '__entity_group/User', title: 'User', isLeaf: true, _data: {...}, _modelType: 'entity' }]
 *   }]
 */
export function convertModelTreeToAntdData(list: ModelTree[]): AntdTreeNode[] {
  return list.map((group) => {
    const groupKey: string = (group as any).key || group.name;
    return {
      key: groupKey,
      title: group.name,
      isLeaf: false,
      children: (group.children || []).map((item: any) => ({
        key: groupKey + '/' + item.name,
        title: item.name,
        isLeaf: true,
        _data: item.data || item,
        _modelType: item.data?.type || item.type,
        _path: groupKey + '/' + item.name,
      })),
    };
  });
}

/**
 * Keep the original convertToTreeData for reference during migration.
 * Can be removed after full migration is verified.
 */
export interface TreeItem {
  type: 'folder' | 'file';
  filename: string;
  path: string;
  children?: TreeItem[];
  data?: any;
  modelType?: string;
}

export function convertTreeItemsToAntdData(items: TreeItem[]): AntdTreeNode[] {
  return items.map((item) => ({
    key: item.path,
    title: item.filename,
    isLeaf: item.type === 'file',
    children: item.children ? convertTreeItemsToAntdData(item.children) : undefined,
    _data: item.data,
    _modelType: item.modelType,
    _path: item.path,
  }));
}
