---
title: 本站技术架构与设计思路
summary: 详细介绍本个人网站所采用的技术方案、架构设计和关键决策背后的思考。
date: 2026-06-22
pinned: true
tags: [Next.js, React, 架构设计, SEO, 安全]
---

本文介绍这个个人网站的整体技术架构、选型理由和设计思路，帮助你了解项目背后的工程决策。

## 技术栈

| 技术                        | 用途                               |
| --------------------------- | ---------------------------------- |
| Next.js 15 (App Router)     | 框架，静态导出生成纯 HTML 站点     |
| React 19                    | UI 组件库                          |
| TypeScript                  | 类型安全                           |
| Tailwind CSS v4             | 原子化样式方案                     |
| gray-matter                 | Markdown frontmatter 解析          |
| react-markdown + remark-gfm | Markdown 渲染（支持 GFM 扩展语法） |
| rehype-highlight            | 代码块语法高亮                     |

## 架构设计

### 静态导出 + 文件系统

本站采用 **静态导出**（`output: "export"`），构建时从文件系统读取所有文章并生成纯静态 HTML。最终产物是一个 `out/` 目录，可以直接托管在 GitHub Pages 等静态服务上。

这个决策的核心考量是：**零服务器成本，完全免费托管**。新增文章后只需 push 到 GitHub，Actions 自动重新构建部署。

```
git push → GitHub Actions → npm run build → 静态 HTML → GitHub Pages
```

### 文章管理

文章使用 Markdown 文件管理，存放在项目根目录的 `content/` 下：

```
content/
├── articles/
│   ├── project-architecture.md    ← 本文
│   ├── building-modern-web-apps.md
│   └── ...
```

每篇文章的 frontmatter 包含元信息：

```yaml
---
title: 文章标题
summary: 文章摘要
date: 2026-06-22
pinned: true # 可选，置顶标记
tags: [React, TypeScript, 前端] # 可选，标签分类
---
```

文件名即 URL slug，例如 `project-architecture.md` 对应 `/articles/project-architecture`。

### 排序逻辑

文章列表的排序规则：

1. 置顶文章（`pinned: true`）始终排在最前面
2. 同级别内按日期倒序排列

## 功能特性

### 标签/分类系统

- 文章通过 frontmatter 中的 `tags` 字段归类
- 文章列表页提供标签筛选按钮，点击可按标签过滤
- 文章详情页显示标签，点击可跳转到对应标签筛选结果
- 标签按使用次数排序显示

### 搜索功能

- 文章列表页顶部提供搜索框
- 支持搜索标题、摘要和标签内容，实时过滤
- 搜索和标签筛选可组合使用
- 纯客户端实现，无需额外后端服务

### 主题切换

- 导航栏提供明亮/暗色主题切换按钮
- 首次访问跟随系统偏好
- 选择保存到 `localStorage`，刷新不丢失
- 通过内联脚本避免页面闪烁（FOUC）
- Tailwind CSS v4 使用 `@custom-variant` 实现类名控制暗色模式

### 文章目录（TOC）

- 文章详情页右侧显示固定目录导航（xl 及以上屏幕宽度）
- 自动从 Markdown 内容中提取 h2、h3 标题
- 使用 IntersectionObserver 实时追踪滚动位置，高亮当前所在章节
- 点击目录项平滑滚动到对应位置
- h3 标题自动缩进，体现层级关系

### 文章列表侧边栏

- 文章详情页左侧显示所有文章列表（xl 及以上屏幕宽度）
- 当前正在阅读的文章高亮
- 置顶文章带 📌 标记
- 支持溢出滚动

### 代码块语法高亮

- 使用 `rehype-highlight`（基于 highlight.js）实现语法高亮
- 支持 TypeScript、JavaScript、YAML、Dockerfile、Shell 等常见语言自动检测
- 采用 One Dark 风格配色方案，与深色代码块背景搭配
- 无需额外配置，Markdown 中标注语言标识即可生效（如 ` ```typescript `）

### 自定义 404 页面

- 渐变色大字「404」+ 说明文案
- 提供渐变色「返回首页」按钮
- fade-in-up 入场动画，保持整体设计语言一致

## 安全防护

### 路径穿越防护

- `getArticleBySlug` 对 slug 参数做正则校验：`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- 仅允许小写字母、数字和连字符，禁止 `..`、`/`、特殊字符
- 解析后的绝对路径必须在 `content/articles/` 目录内，双重验证

### XSS 防护

- `react-markdown` 默认不渲染原始 HTML 标签
- 即使 Markdown 文件中包含 `<script>` 标签也不会执行

### 静态站点的安全优势

- 无服务端代码运行，不存在 SQL 注入、命令注入等服务端攻击面
- 无 API 路由，不存在接口滥用或限流问题
- GitHub Pages 自带 HTTPS，无需自行配置证书

## SEO 方案

- **Metadata**：每个页面通过 Next.js 的 `metadata` / `generateMetadata` 输出 title、description
- **Open Graph**：支持社交平台分享预览（标题、描述、类型）
- **Twitter Card**：支持 `summary_large_image` 卡片
- **JSON-LD**：首页输出 `Person` 结构化数据，文章页输出 `BlogPosting`
- **Sitemap**：构建时自动生成，包含所有文章
- **Robots.txt**：允许所有爬虫抓取
- **Canonical URL**：设置 `metadataBase` 和 canonical 链接

由于使用静态导出，所有页面都是预渲染的完整 HTML，对搜索引擎非常友好。

## UI 设计风格

整体采用活泼、充满活力的配色方案：

- **渐变主色调**：紫色 → 玫红 → 橙色（`#6c63ff` → `#e91e8c` → `#ff6b35`）
- **暗色模式**：深蓝紫背景（`#0f0f1a`），淡紫/粉/橙渐变
- **磨砂玻璃效果**：Header、TOC、侧边栏使用 `backdrop-blur` + 半透明背景
- **去边框化**：卡片使用阴影替代边框，hover 时浮起 + 加深阴影
- **大字体层次**：首页标题 `text-7xl`，渐变色文字
- **微交互动画**：`fade-in-up` 入场动画、hover 缩放、按钮放大效果
- **圆角设计**：`rounded-2xl` 卡片、`rounded-full` 按钮和标签

## 样式方案

使用 Tailwind CSS v4 配合 `@tailwindcss/typography` 插件：

- 通过 CSS 变量（`--accent`、`--surface`、`--gradient-start` 等）统一管理配色
- 暗色模式通过 `@custom-variant dark` 配合 `.dark` 类实现手动切换
- 文章内容区域使用自定义 CSS（`.article-content`），针对标题、段落、列表、代码块、表格、引用等元素定义排版样式
- 响应式设计，xl 以上显示侧边栏，移动端自适应

## 部署方式

项目托管在 GitHub，使用 **GitHub Pages + GitHub Actions** 自动部署：

1. 开发者 push 代码到 `main` 分支
2. GitHub Actions 自动触发：安装依赖 → `npm run build` → 上传 `out/` 目录
3. GitHub Pages 从构建产物中部署静态站点

```
.github/workflows/deploy.yml    ← Actions 工作流配置
out/                            ← 构建产物（自动生成，不提交）
content/articles/               ← Markdown 文章源文件
```

新增文章流程：将 `.md` 文件放入 `content/articles/` → commit & push → Actions 自动构建部署（约 1-2 分钟生效）。

## 为什么不用 CMS？

对于个人技术博客，Markdown 文件方案的优势：

- **无外部依赖**：不需要数据库或第三方服务
- **版本控制友好**：文章可以用 Git 管理
- **编辑灵活**：任何文本编辑器都能写作
- **迁移简单**：纯文本文件，随时可以迁移到其他平台
- **部署简单**：不需要配置数据库连接

## 可能的优化方向

- 添加 RSS 订阅
- 评论系统集成（Giscus / Utterances）
- 图片优化
- 文章分页加载
- 全文搜索索引（FlexSearch / Fuse.js）
- 阅读量统计（接入第三方服务）
