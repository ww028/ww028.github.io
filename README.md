# 魏微的博客

基于 Next.js 16 构建的个人博客，部署于 GitHub Pages。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS v4
- **内容**: Markdown + gray-matter + react-markdown
- **部署**: GitHub Pages (静态导出)

## 功能特性

- 📝 Markdown 文章管理与渲染
- 🎨 明亮/暗色主题切换
- 🔍 文章搜索与标签筛选
- 📑 文章目录 (TOC) 自动生成
- 🔎 SEO 优化 (Open Graph、JSON-LD、Sitemap)
- 📱 响应式设计

## 页面结构

- `/` - 博客首页（文章列表 + 搜索 + 标签筛选）
- `/articles/[slug]` - 文章详情页
- `/about` - 关于我

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态文件
npm run build

# 运行 ESLint
npm run lint
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 添加文章

在 `content/articles/` 目录下创建 `.md` 文件，frontmatter 格式如下：

```yaml
---
title: 文章标题
date: 2026-06-01
tags: [标签1, 标签2]
summary: 文章摘要
pinned: false
publishTo: [blog, personal]
---
```

`publishTo` 必须显式声明：

- `[blog, personal]`：同步到个人网站，并在两个网站展示。
- `[blog]`：只在本博客展示，适合本站架构说明等站点专属文章。

本地预演同步（不写文件）：

```bash
npm run sync:articles:check
```

确认后同步到相邻的 `allenwei-website/content/shared/` 受管理目录：

```bash
npm run sync:articles:personal
```

同步清单会记录内容版本和文件哈希；遇到未受管理的同名文件或被手动修改的托管文件会直接停止，避免静默覆盖。共享模块的本地说明见 `packages/blog-kit/README.md`。

推送共享文章到 `main` 后，`.github/workflows/sync-articles.yml` 会向 `ww028/allenwei-website` 的 `automation/sync-blog-articles` 分支写入受管理内容，并创建或刷新 PR。该工作流需要在本仓库配置 `PERSONAL_REPO_TOKEN`：使用仅授权 `ww028/allenwei-website` 的 fine-grained token，并授予 Contents、Pull requests 的读写权限。未配置时任务会安全跳过；配置后可从 Actions 手动运行一次验证。个人站验证通过并满足来源、提交 SHA 与文件白名单约束后会自动 squash merge；个人服务器仍由人工发布。

完整操作手册见 [`docs/article-publishing-workflow.md`](docs/article-publishing-workflow.md)，后续搜索优化事项见 [`docs/seo-todo.md`](docs/seo-todo.md)。

## 部署

推送代码到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

在线地址：[wwblog.cn](https://wwblog.cn)
