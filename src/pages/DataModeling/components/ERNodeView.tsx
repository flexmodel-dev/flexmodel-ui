import React, {useEffect, useState} from 'react';
import {theme} from 'antd';
import {Entity} from '@/types/data-modeling';
import {KeyOutlined} from '@ant-design/icons';

interface ERNodeViewProps {
  entity: Entity;
  dim?: boolean;
}

const ERNodeView: React.FC<ERNodeViewProps> = ({entity, dim = false}) => {
  const {token} = theme.useToken();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    // 保持组件在 ConfigProvider 主题切换后刷新（token 由 antd 自动派生）
  }, []);
  const fields = entity.fields || [];
  const showFields = expanded ? fields : fields.slice(0, 5);
  const hasMore = fields.length > 5;

  // 配色对齐 DESIGN.md token，经由 antd theme token 语义化（随明暗主题自动适配）
  // canvas -> colorBgContainer / surface-soft -> colorFillQuaternary / hairline -> colorBorderSecondary
  // ink -> colorText / body -> colorTextSecondary / info -> colorInfo
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const dur = '0.28s';
  const bg = token.colorBgContainer;
  const headerBg = token.colorFillQuaternary;
  const border = token.colorBorderSecondary;
  const ink = token.colorText;
  const body = token.colorTextSecondary;
  const accent = token.colorInfo;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: token.borderRadiusLG,
        minWidth: 220,
        minHeight: 40,
        boxShadow: token.boxShadowSecondary,
        padding: '0px 16px 8px 16px',
        fontSize: token.fontSize,
        color: ink,
        position: 'relative',
        transition: `box-shadow ${dur} ${ease}, background-color ${dur} ${ease}, opacity ${dur} ${ease}`,
        cursor: 'pointer',
        opacity: dim ? 0.4 : 1,
      }}
    >
      <div
        style={{
          fontWeight: token.fontWeightStrong ?? 500,
          color: ink,
          marginBottom: 10,
          fontSize: token.fontSizeLG,
          letterSpacing: 0,
          background: headerBg,
          padding: '8px 0',
          borderBottom: `1px solid ${border}`,
          marginLeft: '-16px',
          marginRight: '-16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          transition: `background-color ${dur} ${ease}`,
        }}
      >
        {entity.name}
      </div>
      <div>
        {showFields.map((f, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 0',
              fontSize: token.fontSize,
              color: body,
              borderBottom: idx !== showFields.length - 1 ? `1px solid ${border}` : 'none',
            }}
          >
            <span style={{
              color: accent,
              fontWeight: token.fontWeightStrong ?? 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              {f.identity && <KeyOutlined style={{marginRight: 4, fontSize: 12}}/>}
              {f.name}
            </span>
            <span style={{color: token.colorTextTertiary, fontWeight: 400}}>{f.concreteType || f.type}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 'var(--ant-margin-xs)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setExpanded(e => !e)}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: token.fontSizeLG,
              color: accent,
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
              lineHeight: 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" style={{verticalAlign: 'middle'}}>
              <polyline points="6 10 12 16 18 10" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};

export default ERNodeView;
