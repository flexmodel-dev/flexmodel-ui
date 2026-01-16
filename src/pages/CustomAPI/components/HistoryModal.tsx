import React from "react";
import {Button, Collapse, List, Modal, Typography} from "antd";
import {DiffEditor} from "@monaco-editor/react";
import {useTheme} from "@/store/appStore";

export interface HistoryRecord {
  id: string;
  title: string;
  operator: string;
  time: string;
  detail: string;
  payload: Record<string, any>;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  records: HistoryRecord[];
  onRestore: (record: HistoryRecord) => void;
  currentPayload?: Record<string, any>;
  ignoreFields?: string[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({
                                                     open,
                                                     onClose,
                                                     records,
                                                     onRestore,
                                                     currentPayload,
                                                     ignoreFields,
                                                   }) => {
  const {isDark} = useTheme();
  const defaultIgnore = React.useMemo(
    () => ["updatedAt", "updatedBy", "createdAt", "createdBy"],
    []
  );
  const effectiveIgnore = ignoreFields && ignoreFields.length > 0 ? ignoreFields : defaultIgnore;

  const omitPaths = React.useCallback((input: any, paths: string[]): any => {
    if (!input || typeof input !== "object") return input;
    const cloned = JSON.parse(JSON.stringify(input));

    const deleteByPath = (obj: any, path: string) => {
      if (!obj || typeof obj !== "object") return;
      const segments = path
        .split(".")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!segments.length) return;
      let cursor = obj;
      for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i];
        const idx = Number.isInteger(Number(key)) ? Number(key) : key;
        if (cursor == null) return;
        cursor = cursor[idx as any];
        if (cursor == null) return;
      }
      const last = segments[segments.length - 1];
      const lastKey = Number.isInteger(Number(last)) ? Number(last) : last;
      if (cursor && typeof cursor === "object") {
        if (Array.isArray(cursor) && typeof lastKey === "number") {
          if (lastKey >= 0 && lastKey < cursor.length) {
            cursor.splice(lastKey, 1);
          }
        } else {
          delete cursor[lastKey as any];
        }
      }
    };

    paths.forEach((p) => deleteByPath(cloned, p));
    return cloned;
  }, []);

  return (
    <Modal
      title="历史记录"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <div style={{
        top: 20,
        overflow: "auto",
      }}>
        <List
          itemLayout="vertical"
          dataSource={records}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              extra={
                <Button type="link" onClick={() => onRestore(item)}>
                  还原此版本
                </Button>
              }
            >
              <List.Item.Meta
                title={item.title}
                description={`${item.operator} · ${item.time}`}
              />
              <Typography.Paragraph>{item.detail}</Typography.Paragraph>
              <Collapse
                size="small"
                items={[
                  {
                    key: "payload",
                    label: "变更内容",
                    children: (
                      <div style={{overflow: "hidden", borderRadius: 6}}>
                        <DiffEditor
                          height={240}
                          language="json"
                          theme={isDark ? "vs-dark" : "vs"}
                          original={JSON.stringify(
                            omitPaths(item?.payload ?? {}, effectiveIgnore),
                            null,
                            2
                          )}
                          modified={JSON.stringify(
                            omitPaths(currentPayload ?? {}, effectiveIgnore),
                            null,
                            2
                          )}
                          options={{
                            readOnly: true,
                            fontSize: 12,
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            glyphMargin: false,
                            lineDecorationsWidth: 0,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            renderSideBySide: true,
                            renderWhitespace: "none",
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </List.Item>
          )}
        />
      </div>

    </Modal>
  );
};

export default HistoryModal;

