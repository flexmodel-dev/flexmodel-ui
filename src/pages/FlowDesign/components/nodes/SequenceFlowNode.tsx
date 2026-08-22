import React from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';
import {theme} from 'antd';

const SequenceFlowNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        width: 20,
        height: 20,
        background: selected ? token.colorPrimaryBg : token.colorFillSecondary,
        border: `2px solid ${selected ? token.colorPrimary : token.colorBorder}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          background: token.colorText,
          width: 6,
          height: 6,
        }}
      />

      {data.conditionsequenceflow ? (
        <div
          style={{
            position: 'absolute',
            top: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: token.colorTextSecondary,
            background: token.colorBgContainer,
            padding: '2px 4px',
            borderRadius: 'var(--ant-border-radius-xs)',
            border: `1px solid ${token.colorBorder}`,
            whiteSpace: 'nowrap',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {String(data.conditionsequenceflow)}
        </div>
      ) : null}
    </div>
  );
};

export default SequenceFlowNode;
