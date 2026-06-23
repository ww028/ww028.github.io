# 改造为 GitHub Pages 静态部署

## Context

当前项目使用 Next.js SSR（`force-dynamic`）+ API 路由，依赖 Node.js 服务器运行。用户希望部署到 GitHub Pages，需要改为纯静态导出（`next export`）。GitHub Pages 只能托管静态 HTML/CSS/JS 文件，不支持服务端逻辑。

核心变化：从"运行时读取文件系统"变为"构建时生成所有页面"。新增文章后需要重新构建部署（可通过 GitHub Actions 自动化）。

## 改动清单

### 1. next.config.ts

- 添加 `output: "export"`
- 移除 `headers()` 函数（静态导出不支持自定义响应头）
- 移除 `securityHeaders` 常量（不再需要）

### 2. 移除 force-dynamic

从以下 4 个文件中删除 `export const dynamic = "force-dynamic"`：

- `src/app/page.tsx`
- `src/app/articles/page.tsx`
- `src/app/articles/[slug]/page.tsx`
- `src/app/sitemap.ts`

### 3. 添加 generateStaticParams

在 `src/app/articles/[slug]/page.tsx` 中添加：

```ts
export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}
```

这样构建时会为每篇文章生成静态 HTML。

### 4. 移除阅读量功能

- 删除 `src/app/api/views/route.ts`（整个 api 目录）
- 删除 `src/components/ViewCounter.tsx`
- 从 `src/app/articles/[slug]/page.tsx` 中移除 ViewCounter 的 import 和使用
- 从 `src/components/ArticleList.tsx` 中移除阅读量相关代码（fetch `/api/views`、views 状态、显示逻辑）

### 5. 添加 GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

- 触发条件：push 到 main 分支
- 步骤：checkout → setup Node → install → build → 部署到 gh-pages
- 使用 `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`

### 6. 更新 .gitignore

- 移除 `content/views.json` 相关条目（如已有）
- 添加 `out/` 目录（构建产物）

### 7. 更新 project-architecture.md

更新部署方式章节，反映静态导出 + GitHub Pages + Actions 自动部署的新架构。移除阅读量统计相关描述，移除安全防护中的 API 相关内容。

## 不需要改动的文件

- `src/app/robots.ts` — 纯静态返回，兼容静态导出
- `src/lib/articles.ts` — 构建时读取文件系统，静态导出完全支持
- `src/components/ArticleSidebar.tsx` — 客户端组件，正常工作
- `src/components/TableOfContents.tsx` — 客户端组件，正常工作
- `src/components/ThemeToggle.tsx` — 客户端组件，正常工作

## 权衡

| 项目 | SSR（之前） | 静态导出（之后） |
|------|-------------|-----------------|
| 新增文章 | 放文件即生效 | 需重新构建（Actions 自动） |
| 阅读量 | 有 | 移除 |
| 安全响应头 | next.config 配置 | 无法控制（GitHub Pages 不支持） |
| SEO | 完全支持 | 完全支持（静态 HTML） |
| 部署成本 | 需要服务器 | 免费（GitHub Pages） |

## 验证方式

1. `npm run build` 成功，`out/` 目录生成静态文件
2. `npx serve out` 本地预览，确认页面正常
3. 文章详情页、搜索、标签筛选、主题切换均正常工作
4. 推送到 GitHub 后 Actions 自动部署成功
