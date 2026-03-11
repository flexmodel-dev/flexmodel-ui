import React, {useRef, useState, useCallback} from "react";
import {Button, message, Space, Splitter} from "antd";
import PageContainer from "@/components/common/PageContainer";
import ModelExplorer from "@/pages/DataModeling/components/ModelExplorer.tsx";
import EntityView from "@/pages/DataModeling/components/EntityView";
import NativeQueryForm from "@/pages/DataModeling/components/NativeQueryForm";
import {modifyModel} from "@/services/model.ts";
import {useTranslation} from "react-i18next";
import EnumForm from "@/pages/DataModeling/components/EnumForm";
import type {Enum} from "@/types/data-modeling.d.ts";
import ERDiagram from "@/pages/DataModeling/components/ERDiagramView";
import {useProject} from "@/store/appStore";
import {AppstoreOutlined, UnorderedListOutlined} from "@ant-design/icons";
import ERView from "@/pages/DataView/components/ERView.tsx";

const ModelingPage: React.FC = () => {
  const {t} = useTranslation();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  const [activeModel, setActiveModel] = useState<any>({});
  const [selectModelVersion, setSelectModelVersion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [nativeQueryIsEditing, setNativeQueryIsEditing] = useState(false);
  const enumFormRef = useRef<any>(null);
  const nativeQueryFormRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'er'>('list');

  const handleItemChange = (item: any) => {
    setActiveModel(item);
    setIsEditing(false);
    setNativeQueryIsEditing(false);
  };

  const handleToggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (enumFormRef.current) {
      enumFormRef.current.submit();
    }
  }, []);

  const handleToggleNativeQueryEdit = useCallback(() => {
    setNativeQueryIsEditing(prev => !prev);
  }, []);

  const handleCancelNativeQueryEdit = useCallback(() => {
    setNativeQueryIsEditing(false);
  }, []);

  const handleSaveNativeQuery = useCallback(() => {
    if (nativeQueryFormRef.current) {
      nativeQueryFormRef.current.submit();
    }
  }, []);

  const renderModelView = () => {
    console.log("active:", activeModel);
    switch (true) {
      case activeModel?.type === "entity":
        return <EntityView model={activeModel}/>;
      case activeModel?.type === "enum":
        return (
          <EnumForm
            ref={enumFormRef}
            mode={isEditing ? "edit" : "view"}
            model={activeModel}
            onConfirm={async (anEnum: Enum) => {
              try {
                await modifyModel(projectId, anEnum);
                message.success(t("form_save_success"));
                setSelectModelVersion(selectModelVersion + 1);
                setIsEditing(false);
              } catch (error) {
                console.error(error);
                message.error(t("form_save_failed"));
              }
            }}
          />
        );
      case activeModel?.type === "native_query":
        return (
          <NativeQueryForm
            ref={nativeQueryFormRef}
            mode={nativeQueryIsEditing ? "edit" : "view"}
            model={activeModel}
            onConfirm={async (data) => {
              try {
                await modifyModel(projectId, data);
                message.success(t("form_save_success"));
                setSelectModelVersion(selectModelVersion + 1);
                setNativeQueryIsEditing(false);
              } catch (error) {
                console.error(error);
                message.error(t("form_save_failed"));
              }
            }}
          />
        );
      case activeModel?.type?.endsWith("_group"):
        return <ERDiagram data={activeModel?.children}/>;
      default:
        return <div>Please select a model to operate.</div>;
    }
  };

  return (
    <PageContainer
      title={t('data_modeling')}
      extra={[
        <Space>
          <Button
            type={viewMode === 'list' ? 'default' : 'text'}
            icon={<UnorderedListOutlined/>}
            onClick={() => setViewMode('list')}
            style={{borderTopRightRadius: 4, borderBottomRightRadius: 4, marginLeft: -1}}
          />
          <Button
            type={viewMode === 'er' ? 'default' : 'text'}
            icon={<AppstoreOutlined/>}
            onClick={() => setViewMode('er')}
            style={{borderTopLeftRadius: 4, borderBottomLeftRadius: 4}}
          />

        </Space>
      ]}
    >
      {viewMode === 'list' ? (<>
        <Splitter>
          <Splitter.Panel
            defaultSize="20%"
            max="40%"
            collapsible
          >

            <ModelExplorer
                editable
                onSelect={handleItemChange}
                version={selectModelVersion}
              />
          </Splitter.Panel>
          <Splitter.Panel>
            <div className="pl-2">
              {activeModel?.type === "enum" && (
                <div style={{marginBottom: 16, display: 'flex', justifyContent: 'flex-end'}}>
                  <Space>
                    {!isEditing ? (
                      <Button
                        type="primary"
                        onClick={handleToggleEdit}
                      >
                        {t('edit')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleCancelEdit}
                        >
                          {t('cancel')}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleSave}
                        >
                          {t('save')}
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              )}
              {activeModel?.type === "native_query" && (
                <div style={{marginBottom: 16, display: 'flex', justifyContent: 'flex-end'}}>
                  <Space>
                    {!nativeQueryIsEditing ? (
                      <Button
                        type="primary"
                        onClick={handleToggleNativeQueryEdit}
                      >
                        {t('edit')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleCancelNativeQueryEdit}
                        >
                          {t('cancel')}
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleSaveNativeQuery}
                        >
                          {t('save')}
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              )}
              {renderModelView()}
            </div>
          </Splitter.Panel>
        </Splitter>
      </>) : (<ERView/>)}

    </PageContainer>
  );
};

export default ModelingPage;
