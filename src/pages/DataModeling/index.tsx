import React, {useRef, useState, useCallback} from "react";
import {Button, Empty, message, Modal, Space, Spin, Splitter} from "antd";
import PageContainer from "@/components/common/PageContainer";
import ModelExplorer from "@/pages/DataModeling/components/ModelExplorer.tsx";
import EntityView from "@/pages/DataModeling/components/EntityView";
import NativeQueryForm from "@/pages/DataModeling/components/NativeQueryForm";
import {getModelList, modifyModel} from "@/services/model.ts";
import {useTranslation} from "react-i18next";
import EnumForm from "@/pages/DataModeling/components/EnumForm";
import type {Enum} from "@/types/data-modeling.d.ts";
import ERDiagram from "@/pages/DataModeling/components/ERDiagramView";
import {useProject} from "@/store/appStore";
import {ApartmentOutlined, ReloadOutlined} from "@ant-design/icons";
import type {Entity} from "@/types/data-modeling";
import {spacing} from "@/theme/designTokens";

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
  const [erModalOpen, setErModalOpen] = useState(false);
  const [erModels, setErModels] = useState<Entity[]>([]);
  const [erLoading, setErLoading] = useState(false);

  const handleItemChange = (item: any) => {
    setActiveModel(item);
    setIsEditing(false);
    setNativeQueryIsEditing(false);
  };

  const handleOpenErView = useCallback(() => {
    setErModalOpen(true);
    setErLoading(true);
    getModelList(projectId)
      .then((list) => {
        setErModels(list.filter((m) => m.type === "Entity") as Entity[]);
      })
      .catch((error) => {
        console.error(error);
        message.error(t("get_model_list_failed"));
        setErModels([]);
      })
      .finally(() => setErLoading(false));
  }, [projectId, t]);

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

  const handleRefresh = useCallback(() => {
    setSelectModelVersion(v => v + 1);
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
      case activeModel?.type === "Entity":
        return <EntityView model={activeModel}/>;
      case activeModel?.type === "Enum":
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
      case activeModel?.type === "NativeQuery":
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
        return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%'}}>
          <Empty/>
        </div>;
    }
  };

  return (
    <PageContainer
      title={t('data_modeling')}
      extra={[
        <Space>
          <Button
            icon={<ReloadOutlined/>}
            onClick={handleRefresh}
          />
          <Button
            icon={<ApartmentOutlined/>}
            onClick={handleOpenErView}
            title={t("er_view")}
          />
        </Space>
      ]}
    >
      <Splitter style={{height: '100%'}}>
        <Splitter.Panel
          defaultSize="20%"
          max="40%"
          collapsible
        >
          <div style={{height: '100%', paddingRight: spacing.xs}}>
            <ModelExplorer
              editable
              onSelect={handleItemChange}
              version={selectModelVersion}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div
            style={{height: '100%', display: 'flex', flexDirection: 'column', paddingLeft: spacing.lg, minHeight: 0}}>
            {activeModel?.type === "Enum" && (
              <div style={{marginBottom: spacing.md, display: 'flex', justifyContent: 'flex-end'}}>
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
            {activeModel?.type === "NativeQuery" && (
              <div style={{marginBottom: spacing.md, display: 'flex', justifyContent: 'flex-end'}}>
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

      <Modal
        title={t("er_view")}
        open={erModalOpen}
        onCancel={() => setErModalOpen(false)}
        footer={null}
        width="90%"
        styles={{body: {height: '80vh', padding: 0}}}
        destroyOnClose
      >
        {erLoading ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <Spin/>
          </div>
        ) : (
          <ERDiagram data={erModels}/>
        )}
      </Modal>

    </PageContainer>
  );
};

export default ModelingPage;
