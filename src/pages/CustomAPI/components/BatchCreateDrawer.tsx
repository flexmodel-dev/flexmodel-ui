import type {Field, Model} from '@/types/data-modeling';
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Button, Card, Checkbox, Divider, Drawer, Form, Input, message, Select, Space, Splitter} from "antd";
import ModelExplorer from "@/pages/DataModeling/components/ModelExplorer.tsx";
import {generateAPIs} from "@/services/api-info.ts";
import {useProject} from "@/store/appStore";

interface Props {
  onConfirm: (data: any) => void;
  onCancel: () => void;
  visible: boolean;
}

const BatchCreateDrawer: React.FC<Props> = ({visible, onConfirm, onCancel}) => {

  const {t} = useTranslation();
  const [form] = Form.useForm();
  const [datasource, setDatasource] = useState<any>();
  const [model, setModel] = useState<Model>();
  const [fieldOptions, setFieldOptions] = useState<any[]>();
  const {currentProject} = useProject();
  const projectId = currentProject?.id || '';

  useEffect(() => {
    setFieldOptions(model?.fields?.map((f: Field) => ({value: f.name, label: f.name})));
    form.setFieldsValue({
      datasourceName: datasource,
      modelName: model?.name,
      apiFolder: model?.name,
      idFieldOfPath: model?.fields?.find((f: Field) => f.type === 'id')?.name,
      generateAPIs: ['list', 'pagination', 'view', 'create', 'update', 'delete']
    });
  }, [datasource, form, model]);

  return (
    <Drawer
      title={t('batch_new_api')}
      placement="right"
      onClose={onCancel}
      open={visible}
      size={1200}
      footer={
        <Space>
          <Button onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={async () => {
            form.validateFields().then((values) => {
              generateAPIs(projectId, values).then(() => message.success(t('form_save_success')));
              onConfirm(values);
            });
          }} type="primary">
            {t('conform')}
          </Button>
        </Space>
      }
    >
      <Splitter>
        <Splitter.Panel defaultSize="20%" max="40%" collapsible>
          <ModelExplorer
            datasource={datasource}
            editable={false}
            onSelect={(ds: string, model: Model) => {
              setDatasource(ds);
              setModel(model);
            }}
          />
          <Divider/>
        </Splitter.Panel>
        <Splitter.Panel>
          <Card bodyStyle={{ padding: 12 }}>
            <Form form={form} layout="vertical">
              <Form.Item name="datasourceName" hidden>
                <Input/>
              </Form.Item>
              <Form.Item name="modelName" hidden>
                <Input/>
              </Form.Item>
              <Form.Item label={t('api_folder')} name="apiFolder" required>
                <Input/>
              </Form.Item>
              <Form.Item label={t('path_id_field')} name="idFieldOfPath" required>
                <Select options={fieldOptions}/>
              </Form.Item>
              <Form.Item label={t('generate_apis')} name="generateAPIs" required>
                <Checkbox.Group>
                  <Space orientation="vertical" size="small">
                    <Checkbox value="list" defaultChecked>
                      List
                    </Checkbox>
                    <Checkbox value="view" defaultChecked>
                      View
                    </Checkbox>
                    <Checkbox value="create" defaultChecked>
                      Create
                    </Checkbox>
                    <Checkbox value="update" defaultChecked>
                      Update
                    </Checkbox>
                    <Checkbox value="delete" defaultChecked>
                      Delete
                    </Checkbox>
                    <Checkbox value="pagination" defaultChecked>
                      Pagination
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Form>
          </Card>
        </Splitter.Panel>
      </Splitter>
    </Drawer>
  )
}
export default BatchCreateDrawer;
