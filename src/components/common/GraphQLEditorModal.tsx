import React, {useState} from "react";
import { Modal, Typography } from "antd";
import { useTranslation } from "react-i18next";
import GraphQL from "@/pages/GraphQLAPI/components/GraphQL";
import { GraphQLData } from "@/types/api-management";

interface GraphQLEditorProps {
    visible: boolean;
    value?: GraphQLData;
    onChange?: (value: GraphQLData) => void;
    onClose: () => void;
}

const GraphQLEditorModal: React.FC<GraphQLEditorProps> = ({
    visible,
    value,
    onChange,
    onClose,
}) => {
    const { t } = useTranslation();
  const [tmpValue, setTmpValue] = useState(value || {query: ""});

    const modalTitle = t("apis.graphql.modal_title", {
        defaultValue: "GraphQL编辑器",
    });
    const modalDesc = t("apis.graphql.modal_desc", {
        defaultValue: "请输入GraphQL查询内容。",
    });
    const okText = t("common.confirm", { defaultValue: "确认" });
    const cancelText = t("common.cancel", { defaultValue: "取消" });

    const handleOk = () => {
        onChange?.(tmpValue);
        onClose();
    };

    return (
        <Modal
            title={modalTitle}
            open={visible}
            width="80%"
            onOk={handleOk}
            onCancel={onClose}
            destroyOnHidden
            okText={okText}
            cancelText={cancelText}
        >
            <Typography.Paragraph type="secondary">{modalDesc}</Typography.Paragraph>
            <div style={{ height: 500 }}>
                <GraphQL
                    data={value}
                    onChange={(data: GraphQLData) =>{
                      setTmpValue(data);
                    }}
                />
            </div>
        </Modal>
    );
};

export default GraphQLEditorModal;
