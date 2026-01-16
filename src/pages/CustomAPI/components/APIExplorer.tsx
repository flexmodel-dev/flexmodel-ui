import React, {useMemo, useState} from "react";
import {Button, Dropdown, Input, Spin} from "antd";
import {MoreOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import type {MenuProps} from "antd";
import Tree from "@/components/explore/explore/Tree.jsx";
import {
  ApiFolder,
  ApiMethodDelete,
  ApiMethodGet,
  ApiMethodPatch,
  ApiMethodPost,
  ApiMethodPut,
  IconFile,
  IconFolder,
} from "@/components/explore/icons/Icons.jsx";
import {ApiDefinition} from "@/types/api-management";
import {useTranslation} from "react-i18next";

interface TreeDataNode {
  path: string;
  filename: string;
  type: "folder" | "file";
  data: ApiDefinition;
  children: TreeDataNode[];
}

const filterApiList = (
  apis: ApiDefinition[],
  keyword: string
): ApiDefinition[] => {
  if (!keyword) return apis;

  return apis
    .map((api) => {
      if (api.name.toLowerCase().includes(keyword.toLowerCase())) {
        return api;
      }
      if (api.children) {
        const filteredChildren = filterApiList(api.children, keyword);
        if (filteredChildren.length > 0) {
          return {...api, children: filteredChildren};
        }
      }
      return null;
    })
    .filter(Boolean) as ApiDefinition[];
};

const convertApiListToTreeData = (
  list: ApiDefinition[]
): TreeDataNode[] => {
  return list.map((item) => ({
    path: item.id,
    filename: item.name,
    type: item.type === "FOLDER" ? "folder" : "file",
    data: item,
    children: item.children ? convertApiListToTreeData(item.children) : [],
  }));
};

interface APIExplorerProps {
  apiList: ApiDefinition[];
  selectedApiId?: string;
  onSelectItem: (item: any) => void;
  onShowCreateApiDialog: (parentId?: string | null) => void;
  onShowCreateFolderDialog: (parentId?: string | null) => void;
  onShowBatchCreate: () => void;
  onRename: (data: ApiDefinition) => void;
  onDelete: (id: string, name: string) => void;
}

const APIExplorer: React.FC<APIExplorerProps> = ({
  apiList,
  selectedApiId,
  onSelectItem,
  onShowCreateApiDialog,
  onShowCreateFolderDialog,
  onShowBatchCreate,
  onRename,
  onDelete,
}) => {
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const filteredApiList = useMemo(
    () => filterApiList(apiList, searchText),
    [apiList, searchText]
  );

  const treeData = useMemo(
    () => ({children: convertApiListToTreeData(filteredApiList)}),
    [filteredApiList]
  );

  const createMenuItems: MenuProps["items"] = [
    {
      key: "new_api",
      label: t("new_api"),
      onClick: () => onShowCreateApiDialog(),
    },
    {
      key: "new_folder",
      label: t("new_folder"),
      onClick: () => onShowCreateFolderDialog(),
    },
    {
      key: "batch_new_api",
      label: t("batch_new_api"),
      onClick: onShowBatchCreate,
    },
  ];

  const searchRowStyle = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingBottom: "5px",
  };

  const treeContainerStyle = {
    flex: 1,
    minHeight: 0,
    maxHeight: "calc(100vh - 200px)",
    overflow: "auto",
  };

  const inputStyle = {
    flex: 1,
    marginRight: "5px",
  };

  const containerStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <div style={containerStyle}>
      <div style={searchRowStyle}>
        <Input
          placeholder={t("search_apis")}
          value={searchText}
          onChange={handleSearchChange}
          allowClear
          prefix={<SearchOutlined/>}
          style={inputStyle}
        />
        <Dropdown menu={{items: createMenuItems}}>
          <Button icon={<PlusOutlined/>}/>
        </Dropdown>
      </div>
      <div style={treeContainerStyle}>
        <div style={{height: '100%', overflow: 'auto', maxHeight: '100%'}}>
          <Spin spinning={false} size="small">
            <Tree
              tree={treeData}
              selected={selectedApiId ? {path: selectedApiId} : {path: ""}}
              onClickItem={onSelectItem}
              renderMore={(item: any) => {
                const moreMenuItems: MenuProps["items"] = [];
                
                if (item.type === "folder") {
                  moreMenuItems.push(
                    {
                      key: "new_api",
                      label: t("new_api"),
                      onClick: () => onShowCreateApiDialog(item.data.id),
                    },
                    {
                      key: "new_folder",
                      label: t("new_folder"),
                      onClick: () => onShowCreateFolderDialog(item.data.id),
                    },
                    {
                      type: "divider",
                    }
                  );
                }
                
                moreMenuItems.push(
                  {
                    key: "rename",
                    label: t("rename"),
                    onClick: () => onRename(item.data),
                  },
                  {
                    key: "delete",
                    label: t("delete"),
                    danger: true,
                    onClick: (e) => {
                      e?.domEvent?.stopPropagation();
                      onDelete(item.data.id, item.data.name);
                    },
                  }
                );

                return (
                  <Dropdown
                    menu={{items: moreMenuItems}}
                    trigger={["hover"]}
                  >
                    <MoreOutlined onClick={(e) => e.stopPropagation()}/>
                  </Dropdown>
                );
              }}
              renderIcon={(item: any, nodeType: any) => {
                if (nodeType === "file") {
                  const method = item.data?.method;
                  if (method === "GET") return <ApiMethodGet key={`get${item.path}`}/>;
                  if (method === "POST") return <ApiMethodPost key={`post${item.path}`}/>;
                  if (method === "PUT") return <ApiMethodPut key={`put${item.path}`}/>;
                  if (method === "DELETE")
                    return <ApiMethodDelete key={`delete${item.path}`}/>;
                  if (method === "PATCH")
                    return <ApiMethodPatch key={`patch${item.path}`}/>;
                  return <IconFile key={`file${item.path}`}/>;
                }
                if (item.data && item.data.type === "FOLDER")
                  return <ApiFolder key={`apifolder${item.path}`}/>;
                return <IconFolder key={`folder${item.path}`}/>;
              }}
              compact={true}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default APIExplorer;

