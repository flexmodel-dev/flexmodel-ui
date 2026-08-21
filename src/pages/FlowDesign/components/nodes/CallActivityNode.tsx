import React, {useState} from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';
import {Button, theme} from 'antd';
import {DeleteOutlined, LinkOutlined} from '@ant-design/icons';
import {getNodeBorderColor, getNodeBoxShadow} from '../../utils/nodeStyles';

const CallActivityNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { token } = theme.useToken();
  const hasError = (data as any)?.hasError || false;

  return (
    <div
      style={{
        width: 120,
        height: 60,
        background: token.colorBgContainer,
        border: `2px solid ${getNodeBorderColor(hasError, selected, token.colorError, token.colorPrimary, token.colorBorder)}`,
        borderRadius: token.borderRadiusLG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--ant-font-size-sm)',
        color: token.colorTextSecondary,
        position: 'relative',
        boxShadow: getNodeBoxShadow(hasError, selected, token.boxShadow),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: token.colorBorder,
          width: 8,
          height: 8,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <LinkOutlined style={{fontSize: 'var(--ant-font-size)'}}/>
        <span style={{ fontWeight: 500 }}>{(data?.properties as any)?.name || data?.label as string || '子流程'}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: token.colorBorder,
          width: 8,
          height: 8,
        }}
      />

      {isHovered && data?.onDelete && typeof data.onDelete === 'function' ? (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={e => {
            e.stopPropagation();
            if (typeof data.onDelete === 'function') {
              data.onDelete(id);
            }
          }}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            minWidth: 20,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: '50%',
            color: token.colorError,
            zIndex: 1000,
            boxShadow: token.boxShadowTertiary,
          }}
        />
      ) : null}
    </div>
  );
};

export default CallActivityNode;
