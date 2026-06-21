import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Button, Drawer, Dropdown, Input, message, Modal, Spin, Tree} from "antd";
import type {MenuProps, TreeDataNode} from "antd";
import {MoreOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {createModel, dropModel, getModelList, executeFml} from "@/services/model.ts";
import {useTranslation} from "react-i18next";
import {useLocale} from "@/store/appStore.ts";
import {useProject} from "@/store/appStore";
import type {Model} from '@/types/data-modeling';
import ModelForm from "@/pages/DataModeling/components/ModelForm";
import FmlModelForm from "@/pages/DataModeling/components/FmlModelForm";

// --- Inline icons (migrated from @/components/explore/icons/Icons.jsx) ---
const IconFolder = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 512 512" width="18" height="18">
    <path fill="#FAAD14" d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"/>
  </svg>
);

const IconFile = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 384 512" width="18" height="18">
    <path fill="currentColor" d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48z"/>
  </svg>
);

const IconModel = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#4F8CFF"/>
    <rect x="7" y="9" width="10" height="6" rx="1" fill="#fff"/>
    <rect x="9" y="11" width="6" height="2" rx="1" fill="#4F8CFF"/>
  </svg>
);

const IconEnum = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <circle cx="12" cy="12" r="9" fill="#39bf45"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Arial" fontWeight="bold">E</text>
  </svg>
);

const IconEntityFolder = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <rect x="2" y="7" width="20" height="11" rx="2.5" fill="#FAAD14"/>
    <rect x="2" y="5" width="10" height="4" rx="1.5" fill="#FFE58F"/>
    <rect x="6" y="13" width="12" height="1.2" rx="0.6" fill="#fff"/>
  </svg>
);

const IconEnumFolder = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <rect x="2" y="7" width="20" height="11" rx="2.5" fill="#FAAD14"/>
    <rect x="2" y="5" width="10" height="4" rx="1.5" fill="#FFE58F"/>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Arial" fontWeight="bold">En</text>
  </svg>
);

const IconNativeQueryFolder = () => (
  <svg
    aria-hidden='true'
    focusable='false'
    data-icon='native-query-folder'
    role='img'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    className='icon-native-query-folder'
    width='18' height='18'
  >
    <rect x='2' y='7' width='20' height='11' rx='2.5' fill='#D9A441'/>
    <rect x='2' y='5' width='10' height='4' rx='1.5' fill='#F4D35E'/>
    <text x='12' y='16' textAnchor='middle' fontSize='9' fill='#ffffff' fontFamily='Arial' fontWeight='bold'>NQ</text>
  </svg>
);

const IconNativeQueryModel = () => (
  <svg
    aria-hidden='true'
    focusable='false'
    data-icon='native-query-model'
    role='img'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    className='icon-native-query-model'
    width='18' height='18'
  >
    <circle cx='12' cy='12' r='9' fill='#41454D'/>
    <text x='12' y='16' textAnchor='middle' fontSize='10' fill='#ffffff' fontFamily='Arial' fontWeight='bold'>Q</text>
  </svg>
);

// --- Icon helpers: map group key / model type to the correct icon ---
// Wrapped in a sized container for consistent alignment inside antd Tree
function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function getGroupIcon(key: string, expanded: boolean): React.ReactNode {
  switch (key) {
    case '__entity_group':
      return <IconWrapper>{expanded ? <IconEntityFolderOpen /> : <IconEntityFolder />}</IconWrapper>;
    case '__enum_group':
      return <IconWrapper>{expanded ? <IconEnumFolderOpen /> : <IconEnumFolder />}</IconWrapper>;
    case '__native_query_group':
      return <IconWrapper>{expanded ? <IconNativeQueryFolderOpen /> : <IconNativeQueryFolder />}</IconWrapper>;
    default:
      return <IconWrapper><IconFolder /></IconWrapper>;
  }
}

function getModelIcon(modelType?: string): React.ReactNode {
  switch (modelType) {
    case 'entity': return <IconWrapper><IconModel /></IconWrapper>;
    case 'enum': return <IconWrapper><IconEnum /></IconWrapper>;
    case 'native_query': return <IconWrapper><IconNativeQueryModel /></IconWrapper>;
    default: return <IconWrapper><IconFile /></IconWrapper>;
  }
}

// --- Open-folder icons (expanded state) ---
// Tilted lid + visible inside to clearly distinguish from closed folder
const IconEntityFolderOpen = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <path d="M4 3 L16 3 L12 6 L4 6 Z" fill="#FFE58F"/>
    <path d="M2 7 H22 V18 Q22 20 20 20 H4 Q2 20 2 18 V7 Z" fill="#FAAD14"/>
    <rect x="4" y="7" width="16" height="3" fill="#FFD580"/>
    <rect x="6" y="14" width="12" height="1.2" rx="0.6" fill="#fff"/>
  </svg>
);

const IconEnumFolderOpen = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <path d="M4 3 L16 3 L12 6 L4 6 Z" fill="#FFE58F"/>
    <path d="M2 7 H22 V18 Q22 20 20 20 H4 Q2 20 2 18 V7 Z" fill="#FAAD14"/>
    <rect x="4" y="7" width="16" height="3" fill="#FFD580"/>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Arial" fontWeight="bold">En</text>
  </svg>
);

const IconNativeQueryFolderOpen = () => (
  <svg aria-hidden="true" focusable="false" role="img" viewBox="0 0 24 24" width="18" height="18">
    <path d="M4 3 L16 3 L12 6 L4 6 Z" fill="#F4D35E"/>
    <path d="M2 7 H22 V18 Q22 20 20 20 H4 Q2 20 2 18 V7 Z" fill="#D9A441"/>
    <rect x="4" y="7" width="16" height="3" fill="#E5B030"/>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Arial" fontWeight="bold">NQ</text>
  </svg>
);

// --- Hover-aware title for leaf nodes (shows "more" actions on hover) ---
const TreeNodeTitle: React.FC<{
  node: any;
  editable: boolean;
  onDelete: () => void;
  t: (key: string) => string;
}> = ({ node, editable, onDelete, t }) => {
  const [hovered, setHovered] = useState(false);

  if (!node.isLeaf) {
    return <span style={{ lineHeight: '28px' }}>{String(node.title ?? '')}</span>;
  }

  const menuItems: MenuProps["items"] = editable ? [
    {
      key: "delete",
      label: t("delete"),
      danger: true,
      onClick: onDelete,
    },
  ] : [];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        lineHeight: '28px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {String(node.title ?? '')}
      </span>
      {hovered && menuItems.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={["hover"]}>
          <MoreOutlined onClick={e => e.stopPropagation()} />
        </Dropdown>
      )}
    </span>
  );
};

interface ModelTree {
  name: string;
  children?: ModelTree[];
}

interface ModelBrowserProps {
  editable: boolean;
  onSelect: (model: Model) => void;
  version?: number;
  selectedModelName?: string;
}

const ModelExplorer: React.FC<ModelBrowserProps> = ({
  editable,
  onSelect,
  version,
  selectedModelName,
}) => {
  const {t} = useTranslation();
  const {locale} = useLocale();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  const [modelList, setModelList] = useState<ModelTree[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [filteredModelList, setFilteredModelList] = useState<ModelTree[]>([]);
  const [activeModel, setActiveModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [createModelDrawerVisible, setCreateModelDrawerVisible] = useState(false);
  const [createFmlModelVisible, setCreateFmlModelVisible] = useState(false);
  const [filterText, setFilterText] = useState<string>("");

  const modelFormRef = useRef<any>(null);
  const fmlModelFormRef = useRef<any>(null);

  const addModel = async () => {
    setCreateModelDrawerVisible(false);
    setCreateFmlModelVisible(false);
    await reqModelList();
  };

  const handleModelFormSubmit = async (formData: any) => {
    try {
      await createModel(projectId, formData);
      message.success(t('form_save_success'));
      addModel();
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  const handleFmlModelFormSubmit = async (formData: any) => {
    try {
      await executeFml(projectId, formData.script);
      message.success(t('model_created_success'));
      addModel();
    } catch (error) {
      console.error(error);
      message.error(t('model_creation_failed'));
    }
  };

  const handleModelModalOk = () => {
    if (modelFormRef.current) {
      modelFormRef.current.submit();
    }
  };

  const handleFmlModalOk = () => {
    if (fmlModelFormRef.current) {
      fmlModelFormRef.current.submit();
    }
  };

  const handleModelModalCancel = () => {
    setCreateModelDrawerVisible(false);
    if (modelFormRef.current) {
      modelFormRef.current.reset();
    }
  };

  const handleFmlModalCancel = () => {
    setCreateFmlModelVisible(false);
    if (fmlModelFormRef.current) {
      fmlModelFormRef.current.reset();
    }
  };

  const reqModelList = async () => {
    setModelLoading(true);
    const res: any = await getModelList(projectId);
    setModelLoading(false);
    const groupData = groupByType(res);
    setModelList(groupData);
    setFilteredModelList(groupData);
    setExpandedKeys(expandedKeys.length ? expandedKeys : [groupData[0]?.key]);

    let selectedModel = null;
    if (selectedModelName) {
      for (const group of groupData) {
        if (group.children) {
          const foundModel = group.children.find((child: any) => child.name === selectedModelName);
          if (foundModel) {
            selectedModel = foundModel;
            break;
          }
        }
      }
    }

    const m = selectedModel || activeModel || groupData[0]?.children[0] || null;
    setActiveModel(m);
    onSelect(m);
  };

  const handleDelete = async () => {
    if (activeModel) {
      await dropModel(projectId, activeModel.name);
      await reqModelList();
      setDeleteDialogVisible(false);
    }
  };

  const filterModelTree = (
    models: ModelTree[],
    searchText: string
  ): ModelTree[] => {
    return models
      .map((model) => {
        const filteredChildren = model.children
          ? filterModelTree(model.children, searchText)
          : [];
        if (
          model.name.toLowerCase().includes(searchText.toLowerCase()) ||
          filteredChildren.length > 0
        ) {
          return {...model, children: filteredChildren};
        }
        return null;
      })
      .filter(Boolean) as ModelTree[];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterText(value);
    if (value) {
      const filteredData = filterModelTree(modelList, value);
      setFilteredModelList(filteredData);
    } else {
      setFilteredModelList(modelList);
    }
  };

  useEffect(() => {
    reqModelList();
  }, []);

  useEffect(() => {
    if (locale) {
      reqModelList();
    }
  }, [locale]);

  useEffect(() => {
    if (version) {
      reqModelList();
    }
  }, [version]);

  const groupByType = (data: any): any[] => {
    const groups = data.reduce((acc: any, item: any) => {
      const {type, name, ...rest} = item;
      if (!acc[type]) {
        switch (type) {
          case "entity":
            acc[type] = {
              type: "__entity_group",
              key: "__entity_group",
              name: t("entities"),
              children: [],
              isLeaf: false,
            };
            break;
          case "enum":
            acc[type] = {
              type: "__enum_group",
              key: "__enum_group",
              name: t("enums"),
              children: [],
              isLeaf: false,
            };
            break;
          case "native_query":
            acc[type] = {
              type: "__native_query_group",
              key: "__native_query_group",
              name: t("native_queries"),
              children: [],
              isLeaf: false,
            };
            break;
          default:
            break;
        }
        acc[type].data = {...acc[type]};
      }
      acc[type]?.children.push({
        name,
        type,
        key: name,
        isLeaf: true,
        ...rest,
        data: item,
      });
      return acc;
    }, {});

    const order = ["entity", "enum", "native_query"];
    return order.map((type) => groups[type]).filter(Boolean);
  };

  // ---- antd Tree data: convert filtered model groups into DataNode[] ----
  const treeData = useMemo((): TreeDataNode[] => {
    return filteredModelList.map((group: ModelTree) => {
      const groupKey = (group as any).key || group.name;
      return {
        key: groupKey,
        title: group.name,
        icon: getGroupIcon(groupKey, expandedKeys.includes(groupKey)),
        selectable: true,
        isLeaf: false,
        children: (group.children || []).map((item: any) => {
          const leafKey = groupKey + '/' + item.name;
          return {
            key: leafKey,
            title: item.name,
            icon: getModelIcon(item.data?.type),
            isLeaf: true,
            selectable: true,
            data: item.data || item,
            modelType: item.data?.type,
          };
        }),
      };
    });
  }, [filteredModelList, expandedKeys]);

  // ---- antd Tree selected keys ----
  const selectedKeys = useMemo(() => {
    if (!activeModel || !activeModel.name) return [];
    const group = filteredModelList.find(g =>
      (g.children || []).some(c => c.name === activeModel.name)
    );
    if (group) {
      const groupKey = (group as any).key || group.name;
      return [groupKey + '/' + activeModel.name];
    }
    return [activeModel.name];
  }, [activeModel, filteredModelList]);

  // ---- antd Tree event handlers ----
  const handleTreeSelect = useCallback((keys: React.Key[], info: any) => {
    if (keys.length === 0) return;
    const node = info.node;
    // 点击一级目录（非叶子节点）切换展开/折叠
    if (!node.isLeaf) {
      const key = node.key as React.Key;
      setExpandedKeys(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
      return;
    }
    // 叶子节点：选中模型
    if (node.data) {
      setActiveModel(node.data);
      onSelect(node.data);
    }
  }, [onSelect]);

  const handleTreeExpand = useCallback((keys: React.Key[]) => {
    setExpandedKeys(keys);
  }, []);

  // ---- antd Tree titleRender: inject hover "more" button for leaf nodes ----
  const titleRender = useCallback((nodeData: any) => (
    <TreeNodeTitle
      node={nodeData}
      editable={editable}
      onDelete={() => setDeleteDialogVisible(true)}
      t={t}
    />
  ), [editable, t]);

  const searchRowStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 8px 4px 4px',
    gap: '8px',
  };

  const treeContainerStyle = {
    flex: 1,
    minHeight: 0,
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
    padding: '0 8px 0 0',
  };

  const inputStyle = {
    width: '100%',
    borderRadius: '6px',
  };

  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '4px 0',
  };

  return (
    <div style={containerStyle} className="pr-2">
      <div style={searchRowStyle}>
        <Input
          placeholder={t("search_models")}
          value={filterText}
          onChange={handleSearchChange}
          style={inputStyle}
          allowClear
          prefix={
            <SearchOutlined/>
          }
        />
        {editable && (
          <Dropdown
            menu={{
              items: [
                {
                  key: "create_model",
                  label: t("create_model"),
                  onClick: () => setCreateModelDrawerVisible(true),
                },
                {
                  key: "create_model_by_fml",
                  label: t("create_model_by_fml"),
                  onClick: () => setCreateFmlModelVisible(true),
                },
              ],
            }}
          >
            <Button
              icon={<PlusOutlined/>}
            />
          </Dropdown>
        )}
      </div>

      <div style={treeContainerStyle}>
        <div style={{height: '100%', overflow: 'auto', maxHeight: '100%'}}>
          <style>{`
            /* --- 基础节点样式 --- */
            .model-explorer-tree.ant-tree {
              font-size: 14px;
              line-height: 32px;
              color: #1e293b;
              background: transparent;
            }
            .model-explorer-tree .ant-tree-treenode {
              border-radius: 6px;
              margin: 1px 4px;
              transition: background 0.12s ease;
              align-items: center;
            }
            /* --- 隐藏开关图标 --- */
            .model-explorer-tree .ant-tree-switcher {
              display: none;
            }
            /* --- 缩进 --- */
            .model-explorer-tree .ant-tree-indent-unit {
              width: 18px;
            }
            /* --- 图标垂直居中 --- */
            .model-explorer-tree .ant-tree-iconEle {
              display: inline-flex !important;
              align-items: center;
              justify-content: center;
            }
            /* --- 图标+标题 同行弹性布局 --- */
            .model-explorer-tree .ant-tree-node-content-wrapper {
              display: inline-flex !important;
              align-items: center !important;
              border-radius: 6px;
            }
            .model-explorer-tree .ant-tree-title {
              flex: 1;
              min-width: 0;
            }
            /* --- 悬停 --- */
            .model-explorer-tree .ant-tree-node-content-wrapper:hover {
              background: #f8fafc;
            }
            /* --- 选中 --- */
            .model-explorer-tree .ant-tree-node-selected {
              background: #e0e2e6 !important;
              color: #181d26 !important;
              border-radius: 6px;
              font-weight: 500;
            }
            /* --- 夜间模式 --- */
            .dark .model-explorer-tree.ant-tree {
              color: rgba(255, 255, 255, 0.85);
            }
            .dark .model-explorer-tree .ant-tree-node-content-wrapper:hover {
              background: rgba(255, 255, 255, 0.06);
            }
            .dark .model-explorer-tree .ant-tree-node-selected {
              background: rgba(255, 255, 255, 0.06) !important;
              color: rgba(255, 255, 255, 0.85) !important;
            }
          `}</style>
          <Spin spinning={modelLoading} size="small" style={{ minHeight: 200 }}>
            <Tree
              className="model-explorer-tree"
              treeData={treeData}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onSelect={handleTreeSelect}
              onExpand={handleTreeExpand}
              showIcon
              titleRender={titleRender}
              blockNode
              style={{ background: 'transparent' }}
            />
          </Spin>
        </div>
      </div>

      <Modal
        title={`${t("delete")} '${activeModel?.name}'?`}
        open={deleteDialogVisible}
        onCancel={() => setDeleteDialogVisible(false)}
        onOk={handleDelete}
      >
        {t("delete_dialog_text", {name: activeModel?.name})}
      </Modal>
      <Drawer
        title={t('create_model')}
        open={createModelDrawerVisible}
        onClose={() => setCreateModelDrawerVisible(false)}
        size={800}
        footer={
          <div style={{textAlign: 'left'}}>
            <Button onClick={handleModelModalCancel} style={{marginRight: 8}}>
              {t('cancel')}
            </Button>
            <Button onClick={handleModelModalOk} type="primary">
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <ModelForm
          ref={modelFormRef}
          mode="create"
          onConfirm={handleModelFormSubmit}
          onCancel={handleModelModalCancel}
        />
      </Drawer>
      <Drawer
        title={t('create_model_by_fml')}
        open={createFmlModelVisible}
        onClose={handleFmlModalCancel}
        size={1000}
        footer={
          <div style={{textAlign: 'left'}}>
            <Button onClick={handleFmlModalCancel} style={{marginRight: 8}}>
              {t('cancel')}
            </Button>
            <Button onClick={handleFmlModalOk} type="primary">
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <FmlModelForm
          ref={fmlModelFormRef}
          mode="create"
          onConfirm={handleFmlModelFormSubmit}
          onCancel={() => setCreateFmlModelVisible(false)}
        />
      </Drawer>
    </div>
  );
};

export default ModelExplorer;
