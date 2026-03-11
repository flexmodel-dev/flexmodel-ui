import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Drawer, Dropdown, Input, message, Modal, Spin} from "antd";
import type {MenuProps} from "antd";
import {MoreOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {createModel, dropModel, getModelList, executeIdl} from "@/services/model.ts";
import type {DatasourceSchema} from '@/types/data-source';
import {useTranslation} from "react-i18next";
import {useLocale} from "@/store/appStore.ts";
import {useProject} from "@/store/appStore";
import type {Model} from '@/types/data-modeling';
import {
  IconEntityFolder,
  IconEnum,
  IconEnumFolder,
  IconFile,
  IconFolder,
  IconModel
} from '@/components/explore/icons/Icons.jsx';
import '@/components/explore/styles/explore.scss';
import Tree from '@/components/explore/explore/Tree.jsx';
import ModelForm from "@/pages/DataModeling/components/ModelForm";
import IDLModelForm from "@/pages/DataModeling/components/IDLModelForm";

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
    <rect x='2' y='7' width='20' height='11' rx='2.5' fill='#FAAD14'/>
    <rect x='2' y='5' width='10' height='4' rx='1.5' fill='#FFE58F'/>
    <text x='12' y='16' textAnchor='middle' fontSize='9' fill='#fff' fontFamily='Arial' fontWeight='bold'>NQ</text>
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
    <circle cx='12' cy='12' r='9' fill='#722ED1'/>
    <text x='12' y='16' textAnchor='middle' fontSize='10' fill='#fff' fontFamily='Arial' fontWeight='bold'>Q</text>
  </svg>
);

interface ModelTree {
  name: string;
  children?: ModelTree[];
}

interface TreeItem {
  type: 'folder' | 'file';
  filename: string;
  path: string;
  children?: TreeItem[];
  data?: any;
  modelType?: string;
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
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [filteredModelList, setFilteredModelList] = useState<ModelTree[]>([]);
  const [activeModel, setActiveModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [createModelDrawerVisible, setCreateModelDrawerVisible] = useState(false);
  const [createIDLModelVisible, setCreateIDLModelVisible] = useState(false);
  const [filterText, setFilterText] = useState<string>("");

  const modelFormRef = useRef<any>(null);
  const idlModelFormRef = useRef<any>(null);

  const addModel = async () => {
    setCreateModelDrawerVisible(false);
    setCreateIDLModelVisible(false);
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

  const handleIDLModelFormSubmit = async (formData: any) => {
    try {
      await executeIdl(projectId, formData.idl);
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

  const handleIDLModalOk = () => {
    if (idlModelFormRef.current) {
      idlModelFormRef.current.submit();
    }
  };

  const handleModelModalCancel = () => {
    setCreateModelDrawerVisible(false);
    if (modelFormRef.current) {
      modelFormRef.current.reset();
    }
  };

  const handleIDLModalCancel = () => {
    setCreateIDLModelVisible(false);
    if (idlModelFormRef.current) {
      idlModelFormRef.current.reset();
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

  function convertToTreeData(list: ModelTree[]): TreeItem[] {
    return list.map((group: ModelTree) => ({
      type: 'folder' as const,
      filename: group.name,
      path: (group as any).key || group.name,
      children: (group.children || []).map((item: any) => ({
        type: 'file' as const,
        filename: item.name,
        path: ((group as any).key || group.name) + '/' + item.name,
        data: item.data,
        modelType: item.data?.type,
      })),
    }));
  }

  const treeData = useMemo(() => ({children: convertToTreeData(filteredModelList)}), [filteredModelList]);

  const searchRowStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const treeContainerStyle = {
    flex: 1,
    minHeight: 0,
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
  };

  const inputStyle = {
    width: '100%',
    marginRight: '5px',
  };

  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
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
                  key: "create_model_by_idl",
                  label: t("create_model_by_idl"),
                  onClick: () => setCreateIDLModelVisible(true),
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
          <Spin spinning={modelLoading} size="small">
            <Tree
              tree={treeData}
              selected={activeModel ? {
                path: (() => {
                  const group = filteredModelList.find(g => (g.children || []).some(c => c.name === activeModel.name));
                  if (group) return ((group as any).key || group.name) + '/' + activeModel.name;
                  return activeModel.name;
                })()
              } : {path: ''}}
              onClickItem={(item: any) => {
                setActiveModel(item.data || item);
                if (item.data) onSelect(item.data);
              }}
              renderMore={(item: any) => {
                if (item.type !== 'file') return null;
                const menuItems: MenuProps["items"] = [
                  {
                    key: "delete",
                    label: t("delete"),
                    danger: true,
                    onClick: () => setDeleteDialogVisible(true),
                  },
                ];
                return (
                  <Dropdown
                    menu={{items: menuItems}}
                    trigger={["click"]}
                  >
                    <MoreOutlined onClick={e => e.stopPropagation()}
                    />
                  </Dropdown>
                );
              }}
              renderIcon={(item: any, nodeType: any) => {
                if (nodeType === 'file') {
                  if (item.modelType === 'entity') return <IconModel key={`model${item.path}`}/>;
                  if (item.modelType === 'enum') return <IconEnum key={`enum${item.path}`}/>;
                  if (item.modelType === 'native_query') return <IconNativeQueryModel key={`query${item.path}`}/>;
                  return <IconFile key={`file${item.path}`}/>;
                }
                if (item.path === '__entity_group') return <IconEntityFolder key={`entityfolder${item.path}`}/>;
                if (item.path === '__enum_group') return <IconEnumFolder key={`enumfolder${item.path}`}/>;
                if (item.path === '__native_query_group') return <IconNativeQueryFolder
                  key={`queryfolder${item.path}`}/>;
                return <IconFolder key={`folder${item.path}`}/>;
              }}
              compact={true}
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
        title={t('create_model_by_idl')}
        open={createIDLModelVisible}
        onClose={handleIDLModalCancel}
        size={1000}
        footer={
          <div style={{textAlign: 'left'}}>
            <Button onClick={handleIDLModalCancel} style={{marginRight: 8}}>
              {t('cancel')}
            </Button>
            <Button onClick={handleIDLModalOk} type="primary">
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <IDLModelForm
          ref={idlModelFormRef}
          mode="create"
          onConfirm={handleIDLModelFormSubmit}
          onCancel={() => setCreateIDLModelVisible(false)}
        />
      </Drawer>
    </div>
  );
};

export default ModelExplorer;
