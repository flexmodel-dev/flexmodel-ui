/**
 * FML语法示例
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

interface FmlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
  showDocLink?: boolean;
  docUrl?: string;
}

const FmlEditor: React.FC<FmlEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  showDocLink = false,
  docUrl = 'https://flexmodel.dev/docs/api/model-schema/#fml-%E5%AF%B9%E8%B1%A1%E9%85%8D%E7%BD%AE',
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // 获取当前主题
  const currentTheme = isDark ? 'vs-dark' : 'vs';

  // FML语法提示配置
  const fmlLanguageConfig = {
    id: 'fml',
    extensions: ['.fml'],
    aliases: ['FML', 'fml'],
    mimetypes: ['text/x-fml'],
  };

  // FML语法高亮配置
  const fmlMonarchTokensProvider = {
    defaultToken: '',
    tokenPostfix: '.fml',

    keywords: [
      'model', 'enum', 'seed', 'String', 'Int', 'Long', 'Float', 'Double', 'Boolean',
      'DateTime', 'JSON', 'BigInt', 'Decimal', 'Bytes', 'Unsupported', 'true', 'false', 'null'
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

  // FML语法提示配置
  const fmlCompletionProvider = {
    provideCompletionItems: () => {
      const suggestions = [
        {
          label: 'model',
          kind: 14, // Keyword
          insertText: 'model ${1:modelName} {\n\t${2}\n}',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.model_definition'),
          sortText: '01'
        },
        {
          label: 'enum',
          kind: 14, // Keyword
          insertText: 'enum ${1:enumName} {\n\t${2}\n}',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.enum_definition'),
          sortText: '02'
        },
        {
          label: 'seed',
          kind: 14, // Keyword
          insertText: 'seed ${1:modelName} [\n\t${2}\n]',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.seed_definition'),
          sortText: '03'
        },
        {
          label: 'String',
          kind: 5, // Class
          insertText: 'String',
          documentation: t('fml.string_type'),
          sortText: '04'
        },
        {
          label: 'Int',
          kind: 5, // Class
          insertText: 'Int',
          documentation: t('fml.int_type'),
          sortText: '05'
        },
        {
          label: 'Long',
          kind: 5, // Class
          insertText: 'Long',
          documentation: t('fml.long_type'),
          sortText: '06'
        },
        {
          label: 'Float',
          kind: 5, // Class
          insertText: 'Float',
          documentation: t('fml.float_type'),
          sortText: '07'
        },
        {
          label: 'Double',
          kind: 5, // Class
          insertText: 'Double',
          documentation: t('fml.double_type'),
          sortText: '08'
        },
        {
          label: 'Boolean',
          kind: 5, // Class
          insertText: 'Boolean',
          documentation: t('fml.boolean_type'),
          sortText: '09'
        },
        {
          label: 'DateTime',
          kind: 5, // Class
          insertText: 'DateTime',
          documentation: t('fml.datetime_type'),
          sortText: '10'
        },
        {
          label: 'JSON',
          kind: 5, // Class
          insertText: 'JSON',
          documentation: t('fml.json_type'),
          sortText: '11'
        },
        {
          label: 'BigInt',
          kind: 5, // Class
          insertText: 'BigInt',
          documentation: t('fml.bigint_type'),
          sortText: '12'
        },
        {
          label: 'Decimal',
          kind: 5, // Class
          insertText: 'Decimal',
          documentation: t('fml.decimal_type'),
          sortText: '13'
        },
        {
          label: 'Bytes',
          kind: 5, // Class
          insertText: 'Bytes',
          documentation: t('fml.bytes_type'),
          sortText: '14'
        },
        {
          label: '@id',
          kind: 15, // Property
          insertText: '@id',
          documentation: t('fml.primary_key'),
          sortText: '15'
        },
        {
          label: '@unique',
          kind: 15, // Property
          insertText: '@unique',
          documentation: t('fml.unique_constraint'),
          sortText: '16'
        },
        {
          label: '@default',
          kind: 15, // Property
          insertText: '@default(${1:value})',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.default_value'),
          sortText: '17'
        },
        {
          label: '@comment',
          kind: 15, // Property
          insertText: '@comment("${1:comment}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.field_comment'),
          sortText: '18'
        },
        {
          label: '@length',
          kind: 15, // Property
          insertText: '@length("${1:length}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.field_length'),
          sortText: '19'
        },
        {
          label: '@index',
          kind: 15, // Property
          insertText: '@index(fields: [${1:fieldName}])',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.index_definition'),
          sortText: '20'
        },
        {
          label: '@relation',
          kind: 15, // Property
          insertText: '@relation(localField: "${1:localField}", foreignField: "${2:foreignField}", cascadeDelete: "${3:true|false}")',
          insertTextRules: 4, // InsertAsSnippet
          documentation: t('fml.relation_definition'),
          sortText: '21'
        },
        {
          label: 'ulid()',
          kind: 3, // Function
          insertText: 'ulid()',
          documentation: t('fml.generate_ulid'),
          sortText: '22'
        },
        {
          label: 'uuid()',
          kind: 3, // Function
          insertText: 'uuid()',
          documentation: t('fml.generate_uuid'),
          sortText: '23'
        },
        {
          label: 'now()',
          kind: 3, // Function
          insertText: 'now()',
          documentation: t('fml.current_time'),
          sortText: '24'
        },
        {
          label: 'autoIncrement()',
          kind: 3, // Function
          insertText: 'autoIncrement()',
          documentation: t('fml.auto_increment'),
          sortText: '25'
        }
      ];

      return { suggestions };
    }
  };

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    // 保存编辑器和monaco实例的引用
    editorRef.current = _editor;
    monacoRef.current = monaco;

    // 注册FML语言
    monaco.languages.register(fmlLanguageConfig);
    monaco.languages.setMonarchTokensProvider('fml', fmlMonarchTokensProvider);
    monaco.languages.registerCompletionItemProvider('fml', fmlCompletionProvider);
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
            {t('fml_editor')}
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
            📖 {t('view_fml_docs')}
          </a>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="fml"
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

export default FmlEditor;
