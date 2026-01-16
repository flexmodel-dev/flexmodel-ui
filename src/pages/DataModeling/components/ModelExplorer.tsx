import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Drawer, Dropdown, Input, message, Modal, Select, Spin} from "antd";
import type {MenuProps} from "antd";
import {EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {getDatasourceList, importModels} from "@/services/datasource.ts";
import {createModel, dropModel, getModelList,} from "@/services/model.ts";
import {useNavigate} from "react-router-dom";
import ModelForm from "@/pages/DataModeling/components/ModelForm";
import IDLModelForm from "@/pages/DataModeling/components/IDLModelForm";
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

// 本地查询文件夹图标组件
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
    {/* 文件夹主体 - 黄色系 */}
    <rect x='2' y='7' width='20' height='11' rx='2.5' fill='#FAAD14'/>
    {/* 文件夹盖子 */}
    <rect x='2' y='5' width='10' height='4' rx='1.5' fill='#FFE58F'/>
    {/* 叠加一个Q字母 */}
    <text x='12' y='16' textAnchor='middle' fontSize='9' fill='#fff' fontFamily='Arial' fontWeight='bold'>NQ</text>
  </svg>
);

// 本地查询模型图标组件
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
    {/* 紫色圆形背景，与枚举风格一致 */}
    <circle cx='12' cy='12' r='9' fill='#722ED1'/>
    {/* 白色字母Q */}
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
  datasource?: string;
  editable: boolean;
  onSelect: (ds: string, model: Model) => void;
  version?: number;
  selectedModelName?: string; // 从URL参数传入的选中模型名称
}

const ModelExplorer: React.FC<ModelBrowserProps> = ({
                                                      datasource,
                                                      editable,
                                                      onSelect,
                                                      version,
                                                      selectedModelName,
                                                    }) => {
  const {t} = useTranslation();
  const {locale} = useLocale();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  const navigate = useNavigate();
  const [activeDs, setActiveDs] = useState<string>(datasource || "");
  const [dsList, setDsList] = useState<DatasourceSchema[]>([]);
  const [modelList, setModelList] = useState<ModelTree[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [filteredModelList, setFilteredModelList] = useState<ModelTree[]>([]); // 增加状态来保存过滤后的数据
  const [activeModel, setActiveModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] =
    useState<boolean>(false);
  const [createModelDrawerVisible, setCreateModelDrawerVisible] = useState(false);
  const [createIDLModelVisible, setCreateIDLModelVisible] = useState(false);
  const [filterText, setFilterText] = useState<string>(""); // 监听搜索框输入

  // 表单引用
  const modelFormRef = useRef<any>(null);
  const idlModelFormRef = useRef<any>(null);
  // 添加模型
  const addModel = async () => {
    setCreateModelDrawerVisible(false);
    setCreateIDLModelVisible(false);
    await reqModelList();
  };

  // 处理模型表单提交
  const handleModelFormSubmit = async (formData: any) => {
    try {
      await createModel(projectId, activeDs, formData);
      message.success(t('form_save_success'));
      addModel();
    } catch (error) {
      console.error(error);
      message.error(t('form_save_failed'));
    }
  };

  // 处理IDL模型表单提交
  const handleIDLModelFormSubmit = async (formData: any) => {
    try {
      await importModels(projectId, activeDs, formData);
      message.success(t('model_created_success'));
      addModel();
    } catch (error) {
      console.error(error);
      message.error(t('model_creation_failed'));
    }
  };

  // 处理模态框确认
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

  // 处理模态框取消
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

  // 获取数据源列表
  const reqDatasourceList = async () => {
    const res = await getDatasourceList(projectId);
    setDsList(res);
    setActiveDs(datasource || res[0].name);
  };

  // 获取模型列表
  const reqModelList = async () => {
    setModelLoading(true);
    const res: any = await getModelList(projectId, activeDs);
    setModelLoading(false);
    const groupData = groupByType(res);
    setModelList(groupData);
    setFilteredModelList(groupData); // 初始化时未过滤
    setExpandedKeys(expandedKeys.length ? expandedKeys : [groupData[0]?.key]);

    // 根据URL参数恢复选中的模型，如果没有URL参数则使用默认选择
    let selectedModel = null;
    if (selectedModelName) {
      // 在所有分组中查找匹配的模型
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

    // 如果没有找到匹配的模型或没有URL参数，使用默认选择
    const m = selectedModel || activeModel || groupData[0]?.children[0] || null;
    setActiveModel(m);
    onSelect(activeDs, m);
  };

  // 删除模型
  const handleDelete = async () => {
    if (activeModel) {
      await dropModel(projectId, activeDs, activeModel.name);
      await reqModelList();
      setDeleteDialogVisible(false);
    }
  };

  // 选择数据源
  const onSelectDatasource = (value: string) => {
    setActiveDs(value);
  };

  // 过滤树形结构数据
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

  // 搜索框变化时，更新过滤的树数据
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

  // 获取数据源列表时执行
  useEffect(() => {
    reqDatasourceList();
  }, []);

  // 获取模型列表时执行
  useEffect(() => {
    if (activeDs) {
      reqModelList();
    }
  }, [activeDs]);

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

  /**
   * 按照 type 分组并生成特定结构
   * @param {Array} data - 输入的数据数组
   * @returns {Array} - 转换后的分组结构
   */
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

    // 自定义排序：先entity，再enum，最后native_query
    const order = ["entity", "enum", "native_query"];
    return order.map((type) => groups[type]).filter(Boolean);
  };

  // 转换modelList为Tree.jsx需要的数据结构
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
        modelType: item.data?.type, // 新增字段，标记模型类型entity/enum/native_query
      })),
    }));
  }

  const treeData = useMemo(() => ({children: convertToTreeData(filteredModelList)}), [filteredModelList]);


  const selectRowStyle = {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '5px',
  };

  const searchRowStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const treeContainerStyle = {
    flex: 1,
    minHeight: 0,
    maxHeight: 'calc(100vh - 200px)', // 设置最大高度
    overflow: 'auto',
  };

  const selectStyle = {
    width: "100%",
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
      <div style={selectRowStyle}>
        <Select
          value={activeDs}
          onChange={onSelectDatasource}
          style={selectStyle}
        >
          {dsList.map((item) => (
            <Select.Option key={item.name} value={item.name}>
              <div style={{
                display: "flex",
                alignItems: "center",
              }}>
                {item.name}
              </div>
            </Select.Option>
          ))}
          <Select.Option value="manage" disabled>
            <Button
              type="link"
              icon={<EditOutlined/>}
              style={{
                width: "100%",
                padding: 0,
              }}
              onClick={() => navigate("/data/source")}
            >
              {t("management")}
            </Button>
          </Select.Option>
        </Select>
      </div>
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

      {/* 树形组件区域 */}
      <div style={treeContainerStyle}>
        <div style={{height: '100%', overflow: 'auto', maxHeight: '100%'}}>
          <Spin spinning={modelLoading} size="small">
            <Tree
              tree={treeData}
              selected={activeModel ? {
                path: (() => {
                  // 查找当前选中项的分组
                  const group = filteredModelList.find(g => (g.children || []).some(c => c.name === activeModel.name));
                  if (group) return ((group as any).key || group.name) + '/' + activeModel.name;
                  return activeModel.name;
                })()
              } : {path: ''}}
              onClickItem={(item: any) => {
                setActiveModel(item.data || item);
                if (item.data) onSelect(activeDs, item.data);
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
                // 文件夹分组特殊icon
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
          datasource={activeDs}
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
          datasource={activeDs}
          onConfirm={handleIDLModelFormSubmit}
          onCancel={() => setCreateIDLModelVisible(false)}
        />
      </Drawer>
    </div>
  );
};

export default ModelExplorer;

