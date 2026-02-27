# FlexModel UI Agents 指南

## 项目概况
- 项目类型：React + TypeScript + Ant Design v5
- 构建工具：Vite
- 样式体系：Tailwind CSS + Ant Design Token
- 状态管理：Zustand
- 图形库：antv/x6

## 目录结构
```
src/
├── components/     # 可复用组件
├── pages/         # 页面组件
├── services/      # API服务
├── utils/         # 工具函数
├── types/         # TypeScript类型定义
├── hooks/         # 自定义Hooks
├── store/         # Redux状态管理
└── assets/        # 静态资源
```

## 组件与页面规范
- 页面必须使用 PageContainer 作为根容器
- 页面标题使用 title 属性并支持国际化
- 操作区使用 extra 属性并用 Space 组织
- 优先使用 Ant Design 官方组件
- 避免自定义包装器与自定义样式
- 必要样式优先使用 Tailwind CSS
- 组件需支持夜间模式

## API 设计规范
- API 直接返回业务数据类型（如 Promise<Job[]>）
- 使用 api.get/post/put/delete
- 复杂返回结构使用 PagedResult<T>
- 避免 BaseResponse 包装器

## 代码风格
- 函数组件 + Hooks
- TypeScript 严格模式
- 使用 Ant Design Token
- 代码注释与变量名使用中文

## 开发环境
- Node.js 24+
- npm 11+
- VS Code + Cursor/Trae

## 构建、测试与开发命令
- npm install· 安装依赖
- npm run dev· 启动开发服务器
- npm run build· 构建生产版本

## 交互规范
- 第一句话需要说明当前使用的模型
