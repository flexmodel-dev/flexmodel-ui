import React, {useState} from 'react';
import type {MenuProps} from 'antd';
import {Dropdown, Typography, theme} from 'antd';
import {DatabaseOutlined, DeleteOutlined, MoreOutlined} from '@ant-design/icons';
import type {BucketSchema} from '@/types/storage';
import {useTranslation} from 'react-i18next';

const {Text} = Typography;

interface BucketItemProps {
  bucket: BucketSchema;
  active: boolean;
  onSelect: (bucket: BucketSchema) => void;
  onDelete: (bucket: BucketSchema) => void;
}

const BucketItem: React.FC<BucketItemProps> = ({bucket, active, onSelect, onDelete}) => {
  const {token} = theme.useToken();
  const {t} = useTranslation();
  const [hovered, setHovered] = useState(false);

  const backgroundColor = active
    ? token.colorFillSecondary
    : hovered
      ? token.colorFillTertiary
      : 'transparent';

  const menuItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: t('delete'),
      icon: <DeleteOutlined/>,
      danger: true,
      onClick: () => onDelete(bucket),
    },
  ];

  return (
    <div
      onClick={() => onSelect(bucket)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        marginBottom: token.marginXXS,
        borderRadius: token.borderRadius,
        cursor: 'pointer',
        backgroundColor,
        transition: 'background-color 0.2s',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: token.paddingXS,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: token.paddingSM,
          flex: 1,
          minWidth: 0,
        }}>
          <DatabaseOutlined style={{
            fontSize: token.fontSizeLG,
            color: active ? token.colorText : token.colorTextTertiary,
            flexShrink: 0,
          }}/>
          <Text
            ellipsis
            style={{
              fontSize: token.fontSize,
              fontWeight: active ? token.fontWeightStrong : 400,
              lineHeight: token.lineHeight,
              color: active ? token.colorText : token.colorTextSecondary,
            }}
          >
            {bucket.name}
          </Text>
        </div>
        <Dropdown
          menu={{items: menuItems}}
          trigger={['hover']}
          placement="bottomRight"
        >
          <MoreOutlined
            style={{
              fontSize: token.fontSizeLG,
              color: token.colorTextTertiary,
              cursor: 'pointer',
              padding: `2px ${token.paddingXXS}px`,
              borderRadius: token.borderRadiusXS,
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default BucketItem;
