/**
 * IDL语法示例
// 班级模型
model Classes {
  id: String @id @default(uuid()),
  classCode: String @unique @length(255),
  className?: String @default("A班级"),
  students: Student[] @relation(localField: "id", foreignField: "classId", cascadeDelete: true),
}

// 学生模型
model Student {
  id: String @id @default(uuid()),
  studentName?: String @length(255),
  gender?: UserGender,
  interest?: User_interest[],
  age?: Int,
  classId?: Long,
  studentClass: Classes @relation(localField: "classId", foreignField: "id"),
  studentDetail: StudentDetail @relation(localField: "id", foreignField: "studentId", cascadeDelete: true),
  createdAt?: DateTime @default(now()),
  updatedAt?: DateTime @default(now()),
  @index(name: "IDX_studentName", unique: false, fields: [classId, studentName: (sort: "desc")]),
  @index(unique: false, fields: [studentName]),
  @index(unique: false, fields: [classId]),
}

// 学生详情模型
model StudentDetail {
  id: String @id @default(autoIncrement()),
  studentId?: Long,
  description?: String @length(255),
}

// 用户性别枚举
enum UserGender {
  UNKNOWN,
  MALE,
  FEMALE
}

// 用户爱好枚举
enum user_interest {
  chang,
  tiao,
  rap,
  daLanQiu
}
 */

import React, {useRef} from 'react';
import Editor from '@monaco-editor/react';
import {useTheme} from '@/store/appStore';
import {useTranslation} from 'react-i18next';
import {theme} from 'antd';

interface IDLEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
  showDocLink?: boolean;
  docUrl?: string;
}

const IDLEditor: React.FC<IDLEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  showDocLink = false,
  docUrl = 'https://flexmodel.dev/docs/api/model-schema/#idl-%E5%AF%B9%E8%B1%A1%E9%85%8D%E7%BD%AE',
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // 获取当前主题
  const currentTheme = isDark ? 'vs-dark' : 'vs';

  // IDL语法提示配置
  const idlLanguageConfig = {
    id: 'idl',
    extensions: ['.idl'],
    aliases: ['IDL', 'idl'],
    mimetypes: ['text/x-idl'],
  };

  // IDL语法高亮配置
  const idlMonarchTokensProvider = {
    defaultToken: '',
    tokenPostfix: '.idl',

    keywords: [
      'model', 'enum', 'String', 'Int', 'Long', 'Float', 'Double', 'Boolean',
      'DateTime', 'JSON', 'BigInt', 'Decimal', 'Bytes', 'Unsupported'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
      '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
      '%=', '<<=', '>>=', '>>>='
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    tokenizer: {
      root: [
        [/[a-z_$][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[A-Z][\w$]*/, 'type.identifier'],
        { include: '@whitespace' },
        [/[{}()[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],
        [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        [/[;,.]/, 'delimiter'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],
        [/@[a-zA-Z_]\w*/, 'annotation'],
      ],

      comment: [
        [/[^/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ],

      string: [
        [/[^"]+/, 'string'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      string_single: [
        [/[^']+/, 'string'],
        [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
    },
  };

  // IDL语法提示配置
  const idlCompletionProvider = {
    provideCompletionItems: () => {
      const suggestions = [
        {
          label: 'model',
          kind: 14, // Keyword
          insertText: 'model ${1:modelName} {\n\t${2}\n}',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.model_definition'),
          sortText: '01'
        },
        {
          label: 'enum',
          kind: 14, // Keyword
          insertText: 'enum ${1:enumName} {\n\t${2}\n}',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.enum_definition'),
          sortText: '02'
        },
        {
          label: 'String',
          kind: 5, // Class
          insertText: 'String',
          documentation: t('idl.string_type'),
          sortText: '03'
        },
        {
          label: 'Int',
          kind: 5, // Class
          insertText: 'Int',
          documentation: t('idl.int_type'),
          sortText: '04'
        },
        {
          label: 'Long',
          kind: 5, // Class
          insertText: 'Long',
          documentation: t('idl.long_type'),
          sortText: '05'
        },
        {
          label: 'Float',
          kind: 5, // Class
          insertText: 'Float',
          documentation: t('idl.float_type'),
          sortText: '06'
        },
        {
          label: 'Double',
          kind: 5, // Class
          insertText: 'Double',
          documentation: t('idl.double_type'),
          sortText: '07'
        },
        {
          label: 'Boolean',
          kind: 5, // Class
          insertText: 'Boolean',
          documentation: t('idl.boolean_type'),
          sortText: '08'
        },
        {
          label: 'DateTime',
          kind: 5, // Class
          insertText: 'DateTime',
          documentation: t('idl.datetime_type'),
          sortText: '09'
        },
        {
          label: 'JSON',
          kind: 5, // Class
          insertText: 'JSON',
          documentation: t('idl.json_type'),
          sortText: '10'
        },
        {
          label: 'BigInt',
          kind: 5, // Class
          insertText: 'BigInt',
          documentation: t('idl.bigint_type'),
          sortText: '11'
        },
        {
          label: 'Decimal',
          kind: 5, // Class
          insertText: 'Decimal',
          documentation: t('idl.decimal_type'),
          sortText: '12'
        },
        {
          label: 'Bytes',
          kind: 5, // Class
          insertText: 'Bytes',
          documentation: t('idl.bytes_type'),
          sortText: '13'
        },
        {
          label: '@id',
          kind: 15, // Property
          insertText: '@id',
          documentation: t('idl.primary_key'),
          sortText: '14'
        },
        {
          label: '@unique',
          kind: 15, // Property
          insertText: '@unique',
          documentation: t('idl.unique_constraint'),
          sortText: '15'
        },
        {
          label: '@default',
          kind: 15, // Property
          insertText: '@default(${1:value})',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.default_value'),
          sortText: '16'
        },
        {
          label: '@comment',
          kind: 15, // Property
          insertText: '@comment("${1:comment}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.field_comment'),
          sortText: '17'
        },
        {
          label: '@length',
          kind: 15, // Property
          insertText: '@length("${1:length}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.field_length'),
          sortText: '18'
        },
        {
          label: '@index',
          kind: 15, // Property
          insertText: '@index(fields: [${1:fieldName}])',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.index_definition'),
          sortText: '19'
        },
        {
          label: '@relation',
          kind: 15, // Property
          insertText: '@relation(localField: "${1:localField}", foreignField: "${2:foreignField}", cascadeDelete: "${3:true|false}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('idl.relation_definition'),
          sortText: '20'
        },
        {
          label: 'ulid()',
          kind: 3, // Function
          insertText: 'ulid()',
          documentation: t('idl.generate_ulid'),
          sortText: '21'
        },
        {
          label: 'uuid()',
          kind: 3, // Function
          insertText: 'uuid()',
          documentation: t('idl.generate_uuid'),
          sortText: '22'
        },
        {
          label: 'now()',
          kind: 3, // Function
          insertText: 'now()',
          documentation: t('idl.current_time'),
          sortText: '23'
        },
        {
          label: 'autoIncrement()',
          kind: 3, // Function
          insertText: 'autoIncrement()',
          documentation: t('idl.auto_increment'),
          sortText: '24'
        }
      ];

      return { suggestions };
    }
  };

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    // 保存编辑器和monaco实例的引用
    editorRef.current = _editor;
    monacoRef.current = monaco;

    // 注册IDL语言
    monaco.languages.register(idlLanguageConfig);
    monaco.languages.setMonarchTokensProvider('idl', idlMonarchTokensProvider);
    monaco.languages.registerCompletionItemProvider('idl', idlCompletionProvider);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showDocLink && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: token.colorFillAlter,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            color: token.colorTextSecondary
          }}>
            {t('idl_editor')}
          </span>
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: token.colorPrimary,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📖 {t('view_idl_docs')}
          </a>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="idl"
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme={currentTheme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: {
              enabled: true
            },
            hover: {
              enabled: true
            },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            foldingHighlight: true,
            foldingImportsByDefault: true,
            unfoldOnClickAfterEndOfLine: false
          }}
        />
      </div>
    </div>
  );
};

export default IDLEditor;
