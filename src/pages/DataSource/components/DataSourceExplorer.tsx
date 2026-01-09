import React, {useState, useEffect} from "react";
import {Button, Divider, Dropdown, Spin} from "antd";
import type {MenuProps} from "antd";
import Icon, {BlockOutlined, DeleteOutlined, MoreOutlined} from "@ant-design/icons";
// 导入Tree组件
import Tree from "@/components/explore/explore/Tree.jsx";
// 导入Tree样式
import "@/components/explore/styles/explore.scss";
import type {DatasourceSchema} from "@/types/data-source";
import {getDatasourceList} from "@/services/datasource.ts";
// 数据库图标映射
import MySQL from "@/assets/icons/svg/mysql.svg?react";
import MariaDB from "@/assets/icons/svg/mariadb.svg?react";
import Oracle from "@/assets/icons/svg/oracle.svg?react";
import SqlServer from "@/assets/icons/svg/sqlserver.svg?react";
import PostgreSQL from "@/assets/icons/svg/postgresql.svg?react";
import DB2 from "@/assets/icons/svg/db2.svg?react";
import SQLite from "@/assets/icons/svg/sqlite.svg?react";
import GBase from "@/assets/icons/svg/gbase.svg?react";
import DM8 from "@/assets/icons/svg/dm.svg?react";
import TiDB from "@/assets/icons/svg/tidb.svg?react";
import MongoDB from "@/assets/icons/svg/mongodb.svg?react";
import {useTranslation} from "react-i18next";
import {useProject} from "@/store/appStore";

const DbsMap: Record<string, any> = {
  mysql: MySQL,
  mariadb: MariaDB,
  oracle: Oracle,
  sqlserver: SqlServer,
  postgresql: PostgreSQL,
  db2: DB2,
  sqlite: SQLite,
  gbase: GBase,
  dm: DM8,
  tidb: TiDB,
  mongodb: MongoDB,
};

interface DataSourceExplorerProps {
  onSelect: (ds: DatasourceSchema) => void;
  setDeleteVisible: (visible: boolean) => void;
  setDrawerVisible: (visible: boolean) => void;
  selectedDataSource?: string; // 可选的选中数据源名称
}

const DataSourceExplorer: React.FC<DataSourceExplorerProps> = ({
                                                                 onSelect,
                                                                 setDeleteVisible,
                                                                 setDrawerVisible,
                                                                 selectedDataSource,
                                                               }) => {
  const {t} = useTranslation();
  const { currentProject } = useProject();
  const projectId = currentProject?.id || '';
  
  // 内部管理数据源列表和当前选中的数据源
  const [dsList, setDsList] = useState<DatasourceSchema[]>([]);
  const [activeDs, setActiveDs] = useState<DatasourceSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取数据源列表
  const getDatasourceListHandler = async () => {
    try {
      setLoading(true);
      const list = await getDatasourceList(projectId);
      setDsList(list);

      // 设置初始选中的数据源
      let initialActiveDs = null;
      if (selectedDataSource) {
        initialActiveDs = list.find(ds => ds.name === selectedDataSource) || null;
      } else {
        initialActiveDs = list[0] || null;
      }

      setActiveDs(initialActiveDs);
      if (initialActiveDs) {
        onSelect(initialActiveDs);
      }
    } catch (error) {
      console.error("Failed to load datasource list:", error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据源列表
  useEffect(() => {
    getDatasourceListHandler();
  }, []);

  // 当selectedDataSource变化时更新选中状态
  useEffect(() => {
    if (selectedDataSource && dsList.length > 0) {
      const ds = dsList.find(ds => ds.name === selectedDataSource) || null;
      setActiveDs(ds);
      if (ds) {
        onSelect(ds);
      }
    }
  }, [selectedDataSource, dsList, onSelect]);
  // 将数据源列表转换为Tree组件需要的数据结构
  const treeData = {
    children: dsList.map((ds) => ({
      type: 'file' as const,
      filename: ds.name,
      path: ds.name,
      datasource: ds, // 保存原始数据源对象
    }))
  };

  // 当前选中的数据源
  const selectedItem = {
    path: activeDs?.name || ''
  };

  // 自定义图标渲染函数
  const renderIcon = (item: any, nodeType: any) => {
    if (nodeType === 'file' && item.datasource) {
      const dbKind = item.datasource.config?.dbKind;
      const IconComponent = DbsMap[dbKind];
      return IconComponent ? <Icon component={IconComponent} style={{fontSize: '16px'}}/> : <div/>;
    }
    return <div/>;
  };

  // 更多按钮渲染函数
  const renderMore = (item: any) => {
    if (item.datasource && item.datasource.type !== "SYSTEM") {
      const menuItems: MenuProps["items"] = [
        {
          key: "delete",
          label: t("delete"),
          icon: <DeleteOutlined/>,
          danger: true,
          onClick: (e) => {
            e?.domEvent?.stopPropagation();
            setActiveDs(item.datasource);
            setDeleteVisible(true);
          },
        },
      ];

      return (
        <Dropdown
          menu={{items: menuItems}}
          trigger={["hover"]}
          placement="bottomRight"
        >
          <MoreOutlined
            className="cursor-pointer opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      );
    }
    return null;
  };

  return (
    <Spin spinning={loading}>
      <div style={{minWidth: 200}}>
        <Tree
          tree={treeData}
          selected={selectedItem}
          onClickItem={(item) => {
            setActiveDs(item.datasource);
            onSelect(item.datasource);
          }}
          renderIcon={renderIcon}
          renderMore={renderMore}
        />

        <Divider style={{margin: "8px 0"}}/>
        <Button
          type="primary"
          icon={<BlockOutlined/>}
          onClick={() => setDrawerVisible(true)}
          style={{width: "100%"}}
          ghost
        >
          {t("connect_datasource")}
        </Button>
      </div>
    </Spin>
  );
};

export default DataSourceExplorer;
