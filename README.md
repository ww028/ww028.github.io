# 魏微的个人网站

基于 Next.js 16 构建的个人技术博客，部署于 GitHub Pages。

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
tags: [React, TypeScript]
summary: 文章摘要
pinned: false
---
```

## 部署

推送代码到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

在线地址：[allenwei.top](https://allenwei.top)
