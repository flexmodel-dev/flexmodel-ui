# Flexmodel UI
---

> **Flexmodel UI** 是基于 React 和 Ant Design 的管理后台，作为 Flexmodel 的前端视觉中心。它提供了可视化的数据建模、服务编排、任务监控及系统配置能力，让后端能力的管理变得直观而高效。

## ✨ 核心特性

- **📊 可视化建模**: 支持 ER 图设计、实体关系定义及模型版本管理。
- **⚡ 流程编排**: 可视化的服务编排界面，轻松构建复杂的后端逻辑。
- **⏰ 任务监控**: 实时查看调度任务状态、执行日志及性能指标。
- **📂 存储管理**: 直观的文件管理界面，支持多存储桶操作。
- **🔐 权限控制**: 完整的用户、角色及权限 (RBAC) 配置界面。
- **🎨 现代界面**: 基于 Ant Design 5 构建，支持紧凑主题与响应式布局。
- **🔧 开发者工具**: 内置 API 文档、GraphQL 调试器及代码生成助手。

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装与启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境构建
```bash
# 构建应用
npm run build

# 预览构建结果
npm run preview
```

## 🏗️ 技术栈

- **框架**: React 18, TypeScript, Vite
- **UI 库**: Ant Design 6, Tailwind CSS
- **图形引擎**: @xyflow/react (流程编排), ECharts (图表)
- **状态管理**: Redux Toolkit, Zustand
- **编辑器**: Monaco Editor
- **国际化**: i18next

## 📁 项目结构

```text
src/
├── components/          # 可复用 UI 组件 (通用组件、AI 对话、布局等)
├── pages/               # 业务页面
│   ├── DataModeling/    # 数据建模 (ER 图、实体、字段)
│   ├── FlowDesign/      # 流程设计器
│   ├── Flow/            # 流程定义与实例管理
│   ├── FlowDetail/      # 流程实例详情
│   ├── Scheduling/      # 任务调度 (触发器、执行日志)
│   ├── GraphQLAPI/      # GraphQL API 管理
│   ├── OpenAPI/         # OpenAPI 管理
│   ├── APILog/          # API 日志
│   ├── Authentication/  # 认证 (API Key、OIDC)
│   ├── Storage/         # 文件存储管理
│   ├── Overview/        # 项目概览与监控
│   ├── Member/          # 成员与角色管理
│   ├── Settings/        # 系统设置
│   └── ...              # 更多页面
├── services/            # API 请求封装
├── store/               # Redux & Zustand 状态管理
├── hooks/               # 自定义 Hooks
├── theme/               # 设计令牌与主题
├── types/               # TypeScript 类型定义
├── locales/             # 国际化文件
└── utils/               # 工具函数
```