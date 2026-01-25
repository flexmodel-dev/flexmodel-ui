import React, {useRef} from 'react';
import Editor from '@monaco-editor/react';
import {theme} from 'antd';
import {registerGroovyLanguage} from '@/utils/monaco-groovy';

interface ScriptEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: 'javascript' | 'groovy' | 'sql' | 'json';
  height?: string | number;
  readOnly?: boolean;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  height = '300px',
  readOnly = false,
}) => {
  const { token } = theme.useToken();
  const editorRef = useRef<any>(null);

  // 根据当前主题决定编辑器主题
  const editorTheme = token.colorBgContainer === '#ffffff' ? 'light' : 'vs-dark';

  const handleEditorChange = (value: string | undefined) => {
    onChange?.(value);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    // 如果是Groovy语言，注册Groovy语言支持
    if (language === 'groovy') {
      registerGroovyLanguage(monaco);
    }
    editor.onKeyDown((event: any) => {
      if (event?.keyCode === monaco?.KeyCode?.Space) {
        event.stopPropagation();
      }
    });
    editor.focus();
  };

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: 'hidden'
      }}
    >
      <Editor
        height={height}
        language={language}
        value={value || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={<div style={{ padding: '20px', textAlign: 'center', color: token.colorTextSecondary }}>加载编辑器中...</div>}
      />
    </div>
  );
};

export default ScriptEditor;
