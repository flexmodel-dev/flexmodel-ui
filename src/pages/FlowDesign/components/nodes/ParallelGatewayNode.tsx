import React from 'react';
import {Handle, NodeProps, Position} from '@xyflow/react';
import {DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Button, theme} from 'antd';
import {getNodeBorderColor, getNodeBoxShadow} from '../../utils/nodeStyles';

const ParallelGatewayNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { token } = theme.useToken();
  const [isHovered, setIsHovered] = React.useState(false);
  const hasError = (data as any)?.hasError || false;
  
  return (
    <div
      style={{
        width: 60,
        height: 60,
        background: selected ? token.colorPrimaryBg : token.colorBgContainer,
        border: `2px solid ${getNodeBorderColor(hasError, selected, token.colorError, token.colorPrimary, token.colorBorder)}`,
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 'var(--ant-border-radius)',
        boxShadow: getNodeBoxShadow(hasError, selected),
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
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: token.colorBorder,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: token.colorBorder,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          background: token.colorBorder,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: token.colorBorder,
          width: 6,
          height: 6,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          background: token.colorBorder,
          width: 6,
          height: 6,
        }}
      />

      {isHovered && (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            (data as any)?.onDelete?.(id);
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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          title="删除节点"
        />
      )}

      <PlusCircleOutlined
        style={{
          fontSize: '20px',
          color: token.colorPrimary,
          transform: 'rotate(-45deg)'
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: -25,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'var(--ant-font-size-sm)',
          color: token.colorTextSecondary,
          whiteSpace: 'nowrap',
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {String((data.properties as any)?.name || data.name || '并行网关')}
      </div>
    </div>
  );
};

export default ParallelGatewayNode;
