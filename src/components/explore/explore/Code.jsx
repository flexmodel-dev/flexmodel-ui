import Editor from '@monaco-editor/react'
import React, {useEffect} from 'react'
import markdownit from 'markdown-it';
import {Typography} from 'antd';

function Code({ item }) {
  const code = (item?.content ?? '').replace(/\t/g, '  ')
  const language = item?.language

  if (language === 'markdown' && !item?.force) {
    const md = markdownit({ html: true, breaks: true });
    return (
      <div className='markdown' style={{ height: '400px', overflowY: 'auto', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
        <Typography>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
          <div dangerouslySetInnerHTML={{ __html: md.render(code) }} />
          </Typography>
      </div>
    )
  }

  useEffect(() => {
    console.log('item=======', item)
  }, [item]);

  // 将语言映射到 Monaco Editor 支持的语言
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'kt': 'kotlin',
      'groovy': 'groovy',
      'properties': 'properties',
      'git': 'git',
      'md': 'markdown',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml'
    }
    return languageMap[lang] || lang
  }

  const monacoLanguage = getMonacoLanguage(language)

  return (
    <div style={{ height: '400px', borderRadius: '6px' }}>
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          folding: true,
          foldingStrategy: 'indentation'
        }}
      />
    </div>
  )
}

export default Code
