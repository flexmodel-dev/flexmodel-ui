# FlexModel UI

[English](./README_EN.md) | 中文

---

## FlexModel UI - 面向下一代应用程序的统一数据访问层

FlexModel UI 是一个开源的、免费的统一数据访问层解决方案，专为下一代应用程序设计。它提供全面的数据建模、API管理和数据源集成功能，支持私有化部署。

### ✨ 核心特性

- **🔗 统一数据访问**: 无缝连接多种数据源（MySQL、PostgreSQL、Oracle、MongoDB等）
- **📊 数据建模**: 可视化ER图设计和实体关系建模
- **🔌 API管理**: 支持REST API、GraphQL、gRPC、WebSocket和MQTT
- **🛡️ 身份提供商**: 集成的身份和访问管理
- **📈 数据可视化**: 交互式图表和数据探索工具
- **🌐 多语言支持**: 内置国际化（i18n）
- **🎨 现代界面**: 基于Ant Design构建的美观响应式界面
- **🔧 开发者工具**: API文档、代码生成和调试工具

### 🚀 快速开始

#### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

#### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/flexmodel-devs/flexmodel-ui.git
cd flexmodel-ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 生产环境构建

```bash
# 构建应用
npm run build

# 预览构建结果
npm run preview
```

### 📁 项目结构

```
src/
├── components/          # 可复用UI组件
├── pages/              # 页面组件
│   ├── DataSource/     # 数据源管理
│   ├── DataModeling/   # 数据建模工具
│   ├── APIManagement/  # API管理
│   ├── DataView/       # 数据可视化
│   └── Settings/       # 应用设置
├── services/           # API服务
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── locales/            # 国际化文件

.cursor/                 # Cursor AI 配置文件
├── rules.md            # 开发规则和规范
├── context.md          # 项目上下文信息
├── templates.md        # 代码模板库
├── types.md            # 类型定义库
└── settings.json       # Cursor 设置
```

### 🛠️ 技术栈

- **前端框架**: React 18, TypeScript, Vite
- **UI框架**: Ant Design 5 (紧凑主题)
- **状态管理**: Redux Toolkit
- **路由**: React Router DOM
- **图表**: antv/x6
- **样式**: Tailwind CSS + Ant Design Token系统
- **国际化**: i18next

### 🤖 AI 开发助手

本项目配置了完整的 Cursor AI 开发助手支持：

- **智能代码生成**: 基于项目规范的代码模板
- **类型安全**: 完整的 TypeScript 类型定义
- **设计规范**: 紧凑主题和 Ant Design 最佳实践
- **API 设计**: 标准化的 API 接口规范
- **组件库**: 可复用的组件模板

详细配置请查看 `.cursor/` 目录下的配置文件。

### 📖 文档

- [API文档](./docs/api.md)
- [用户指南](./docs/user-guide.md)
- [开发者指南](./docs/developer-guide.md)
- [部署指南](./docs/deployment.md)

### 🤝 贡献

我们欢迎贡献！详情请查看[贡献指南](./CONTRIBUTING.md)。

### 📄 许可证

本项目采用MIT许可证 - 详情请查看[LICENSE](./LICENSE)文件。

---

## 🔗 相关链接

- **官方网站**: [https://flexmodel.io](https://flexmodel.io)
- **文档中心**: [https://docs.flexmodel.io](https://docs.flexmodel.io)
- **问题反馈**: [https://github.com/your-org/flexmodel-ui/issues](https://github.com/your-org/flexmodel-ui/issues)
- **社区讨论**: [https://github.com/your-org/flexmodel-ui/discussions](https://github.com/your-org/flexmodel-ui/discussions)

## ⭐ Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/flexmodel-ui&type=Date)](https://star-history.com/#your-org/flexmodel-ui&Date)
