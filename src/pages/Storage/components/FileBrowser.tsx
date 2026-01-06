import React, {useState} from 'react';
import {Button, Breadcrumb, Table, Space, message, Upload, Modal, Input, Popconfirm} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import type {FileItem} from '@/types/storage';
import {useTranslation} from 'react-i18next';

interface FileBrowserProps {
  storageName: string;
}

const FileBrowser: React.FC<FileBrowserProps> = ({storageName}) => {
  const {t} = useTranslation();
  console.log('FileBrowser for storage:', storageName);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [createFolderVisible, setCreateFolderVisible] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const mockFiles: FileItem[] = [
    {name: 'documents', type: 'folder', path: '/documents', lastModified: '2024-01-15 10:30:00'},
    {name: 'images', type: 'folder', path: '/images', lastModified: '2024-01-14 15:20:00'},
    {name: 'report.pdf', type: 'file', size: 1024000, path: '/report.pdf', lastModified: '2024-01-13 09:15:00'},
    {name: 'data.csv', type: 'file', size: 51200, path: '/data.csv', lastModified: '2024-01-12 14:45:00'},
    {name: 'backup.zip', type: 'file', size: 5120000, path: '/backup.zip', lastModified: '2024-01-11 11:00:00'},
  ];

  const loadFiles = async () => {
    setLoading(true);
    try {
      setFileList(mockFiles);
    } catch (error) {
      console.error(error);
      message.error(t('load_files_failed'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const handleFolderClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const handleUpload = () => {
    setUploadVisible(true);
  };

  const handleCreateFolder = () => {
    setCreateFolderVisible(true);
  };

  const handleCreateFolderOk = async () => {
    if (!folderName.trim()) {
      message.warning(t('folder_name_required'));
      return;
    }
    try {
      const newFolder: FileItem = {
        name: folderName,
        type: 'folder',
        path: `${currentPath}/${folderName}`.replace(/\/+/g, '/'),
        lastModified: new Date().toLocaleString()
      };
      setFileList([...fileList, newFolder]);
      message.success(t('create_folder_success'));
      setCreateFolderVisible(false);
      setFolderName('');
    } catch (error) {
      console.error(error);
      message.error(t('create_folder_failed'));
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      setFileList(fileList.filter(item => item.path !== file.path));
      message.success(t('delete_file_success'));
    } catch (error) {
      console.error(error);
      message.error(t('delete_file_failed'));
    }
  };

  const handleBatchDelete = async () => {
    try {
      setFileList(fileList.filter(item => !selectedRowKeys.includes(item.path)));
      setSelectedRowKeys([]);
      message.success(t('batch_delete_success'));
    } catch (error) {
      console.error(error);
      message.error(t('batch_delete_failed'));
    }
  };

  const handleDownload = (file: FileItem) => {
    message.info(t('download_file', {name: file.name}));
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getBreadcrumbItems = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const items: any[] = [{title: <a onClick={() => handleBreadcrumbClick('/')}>根目录</a>}];
    let path = '';
    parts.forEach((part, index) => {
      path += '/' + part;
      if (index === parts.length - 1) {
        items.push({title: part});
      } else {
        items.push({title: <a onClick={() => handleBreadcrumbClick(path)}>{part}</a>});
      }
    });
    return items;
  };

  const columns: ColumnsType<FileItem> = [
    {
      title: t('file_name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FileItem) => (
        <Space>
          {record.type === 'folder' ? (
            <FolderOutlined style={{color: '#1890ff', fontSize: 18}}/>
          ) : (
            <FileOutlined style={{color: '#8c8c8c', fontSize: 18}}/>
          )}
          <a onClick={() => handleFolderClick(record)} style={{fontSize: 14}}>
            {text}
          </a>
        </Space>
      ),
    },
    {
      title: t('file_size'),
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
      sorter: (a: FileItem, b: FileItem) => (a.size || 0) - (b.size || 0),
    },
    {
      title: t('last_modified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      sorter: (a: FileItem, b: FileItem) => {
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: t('operations'),
      key: 'actions',
      render: (_: any, record: FileItem) => (
        <Space size="small">
          {record.type === 'file' && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined/>}
              onClick={() => handleDownload(record)}
            >
              {t('download')}
            </Button>
          )}
          <Popconfirm
            title={t('delete_confirm')}
            description={t('delete_file_confirm_desc', {name: record.name})}
            onConfirm={() => handleDelete(record)}
            okText={t('confirm')}
            cancelText={t('cancel')}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined/>}>
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{marginBottom: 16}}>
        <Breadcrumb items={getBreadcrumbItems()}/>
      </div>

      <div style={{marginBottom: 16}}>
        <Space>
          <Button icon={<UploadOutlined/>} onClick={handleUpload}>
            {t('upload')}
          </Button>
          <Button icon={<PlusOutlined/>} onClick={handleCreateFolder}>
            {t('create_folder')}
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={t('batch_delete_confirm')}
              description={t('batch_delete_confirm_desc', {count: selectedRowKeys.length})}
              onConfirm={handleBatchDelete}
              okText={t('confirm')}
              cancelText={t('cancel')}
            >
              <Button danger icon={<DeleteOutlined/>}>
                {t('batch_delete')}
              </Button>
            </Popconfirm>
          )}
          <Button icon={<ReloadOutlined/>} onClick={loadFiles}>
            {t('refresh')}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={fileList}
        rowKey="path"
        loading={loading}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        scroll={{y: 'calc(100vh - 350px)'}}
      />

      <Modal
        title={t('upload_file')}
        open={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUploadVisible(false)}>
            {t('close')}
          </Button>,
        ]}
      >
        <Upload.Dragger
          multiple
          showUploadList={true}
          customRequest={() => {}}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{fontSize: 48, color: '#1890ff'}}/>
          </p>
          <p className="ant-upload-text">{t('upload_drag_text')}</p>
          <p className="ant-upload-hint">{t('upload_hint')}</p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title={t('create_folder')}
        open={createFolderVisible}
        onOk={handleCreateFolderOk}
        onCancel={() => {
          setCreateFolderVisible(false);
          setFolderName('');
        }}
        okText={t('confirm')}
        cancelText={t('cancel')}
      >
        <Input
          placeholder={t('folder_name_placeholder')}
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onPressEnter={handleCreateFolderOk}
        />
      </Modal>
    </div>
  );
};

export default FileBrowser;
