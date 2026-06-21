import React, {useEffect, useState} from 'react'

import {IconChevronDown, IconChevronRight, IconFile, IconFolder} from '../icons/Icons.jsx'

/**
 * @param {Object} props
 * @param {Object} props.tree
 * @param {Object} props.selected
 * @param {Function} props.onClickItem
 * @param {Function} [props.renderMore]
 * @param {(item: any, nodeType: 'file'|'folder') => React.ReactNode} [props.renderIcon] 自定义icon渲染函数
 */
function Tree({ tree, selected, onClickItem, renderMore, renderIcon, compact = false }) {
  const [folders, setFolders] = useState([])
  // 1. li-file加一个state hoverFilePath，onMouseEnter/onMouseLeave控制
  const [hoverFilePath, setHoverFilePath] = useState(null);

  useEffect(() => {
    const treeToArray = map => {
      const recursive = (mapRec, acc) => {
        mapRec.forEach(item => {
          if (item.type === 'folder') {
            acc.push({
              filename: item?.filename,
              path: item?.path,
              hidden: item?.hidden ?? false,
            })
            if (item?.children) {
              recursive(item.children, acc)
            }
          }
        })
        return acc
      }
      return recursive(map, [])
    }
    setFolders(treeToArray(tree.children))
  }, [tree])

  const renderItem = (item, depth = 0) => {
    if (item.type === 'folder') {
      const folder = folders.find(f => f.path === item.path)
      const isHidden = folder?.hidden ?? true
      return (
        <li
          key={`li${item.path}`}
          className={`li-folder ${isHidden ? 'folder-hide' : ''}`}
          onMouseEnter={() => setHoverFilePath(item.path)}
          onMouseLeave={() => setHoverFilePath(null)}
        >
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            onMouseEnter={() => setHoverFilePath(item.path)}
            onMouseLeave={() => setHoverFilePath(null)}
          >
            <a
              href='/#'
              key={`s1${item.path}`}
              className={`folder level-${depth}`}
              style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              onClick={e => {
                e.preventDefault()
                setFolders(folders => folders.map(f =>
                  f.path === item.path ? { ...f, hidden: !(f?.hidden ?? true) } : f
                ))
              }}
            >
              <span key={`s2${item.path}`} className='text' style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(item?.children?.length ?? 0) > 0 && (
                  isHidden ? <IconChevronRight /> : <IconChevronDown />
                )}
                <span key={`s3${item.path}`} className='icon'>
                  {typeof renderIcon === 'function' ? renderIcon(item, 'folder') : <IconFolder key={`s4${item.path}`} />}
                </span>
                {item.filename}
              </span>
            </a>
            {/* 文件夹hover时显示更多按钮 */}
            {typeof renderMore === 'function' && hoverFilePath === item.path && renderMore(item, depth)}
          </div>
          {item?.children && (
            <ul className='ul' key={`ul${item.path}`}>
              {item.children.map(it => renderItem(it, depth + 1))}
            </ul>
          )}
        </li>
      )
    }
    // File
    // const isDisabled = item?.language === null
    const isDisabled = false;
    const isSelected = selected?.path === item?.path
    return (
      <li
        key={`li${item.path}`}
        className='li-file'
        onMouseEnter={() => setHoverFilePath(item.path)}
        onMouseLeave={() => setHoverFilePath(null)}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          onMouseEnter={() => setHoverFilePath(item.path)}
          onMouseLeave={() => setHoverFilePath(null)}
        >
          <a
            href='/#'
            key={`s1${item.path}`}
            tabIndex={`${isDisabled ? -1 : ''}`}
            className={`file level-${depth} ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={e => {
              e.preventDefault()
              if (!isDisabled) {
                onClickItem(item)
              }
            }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <span key={`s2${item.path}`} className='text' style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span key={`s3${item.path}`} className='icon'>
                {typeof renderIcon === 'function' ? renderIcon(item, 'file') : <IconFile key={`s4${item.path}`} />}
              </span>
              {item.filename}
            </span>
          </a>
          {/* 仅悬浮时显示更多按钮 */}
          {typeof renderMore === 'function' && hoverFilePath === item.path && renderMore(item, depth)}
        </div>
      </li>
    )
  }

  return (
    <ul className={`explorer-ul${compact ? ' explorer-ul-compact' : ''}`}>
      {tree.children.map(item => renderItem(item, 0))}
    </ul>
  )
}

export default Tree
