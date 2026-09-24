# 双站文章写作、同步与部署操作手册

本文记录当前两个网站从文章编写到线上发布的实际操作流程。

## 1. 系统边界

| 对象 | 职责 | 发布方式 |
| --- | --- | --- |
| `wwblog.cn`（仓库：`ww028.github.io`） | 共享文章唯一来源、纯静态博客 | 推送 `main` 后由 GitHub Pages 自动部署 |
| `allenwei-website` | 综合个人网站，共享文章是其中一个模块 | 内容 PR 自动合并，服务器仍由维护者手动发布 |

共享文章正文只在博客仓库维护。个人站的 `content/shared/` 是受同步清单管理的副本，不应手工编辑。

## 2. 新建或修改共享文章

进入博客仓库：

```bash
cd /Users/bytedance/personal/ww028.github.io
```

文章位于：

```text
content/articles/
```

共享文章 frontmatter：

```yaml
---
title: 文章标题
summary: 文章摘要
date: 2026-09-24
pinned: false
tags: [标签1, 标签2]
publishTo: [blog, personal]
---
```

发布范围：

- `[blog, personal]`：博客与个人站共同展示。
- `[blog]`：只在博客展示。
- `[personal]`：只用于个人站专属文章；此类文章应在个人站 `content/articles/` 中维护，不应放入博客仓库。

如果文章引用共享图片，图片放入博客仓库：

```text
public/article-assets/
```

Markdown 使用根路径引用：

```markdown
![图片说明](/article-assets/example.png)
```

## 3. 发布前验证

普通文章新增或修改至少执行：

```bash
npm run sync:articles:check
npm run build
```

`sync:articles:check` 只预演，不写入个人站。重点检查输出：

- `writes`：本次新增或更新的共享文件；
- `deletes`：本次准备下架的托管文件；
- `articles`：共享文章总数；
- 是否存在同名冲突、人工修改冲突、缺失资源或 frontmatter 错误。

涉及正文渲染、标题 ID、目录、Markdown 安全或同步程序变更时，额外执行：

```bash
npm run test:blog-kit
npm run test:article-sync
```

## 4. 提交博客仓库

```bash
git add content/articles/<article>.md
# 有共享图片时一并添加
git add public/article-assets/
git commit -m "docs: add article"
git push origin main
```

推送 `main` 后会同时触发两条自动流程。

## 5. 博客自动部署

工作流：

```text
.github/workflows/deploy.yml
```

自动执行：

1. 安装依赖；
2. 构建共享渲染包；
3. 执行 Next.js 静态构建；
4. 上传 `out/`；
5. 部署 GitHub Pages。

成功后博客文章自动发布到 `https://wwblog.cn`，不需要人工部署；GitHub Pages 默认地址只作为底层托管入口。

## 6. 共享文章自动进入个人站

博客工作流：

```text
.github/workflows/sync-articles.yml
```

依赖博客仓库 Secret：

```text
PERSONAL_REPO_TOKEN
```

自动执行：

1. 筛选 `publishTo` 包含 `personal` 的文章；
2. 校验 frontmatter 与共享资源；
3. 读取个人站旧 manifest；
4. 检查未托管同名文件和人工修改冲突；
5. 更新个人站 `content/shared/articles/`；
6. 同步 `public/article-assets/`；
7. 更新 `content/.article-sync-manifest.json`；
8. 推送 `automation/sync-blog-articles` 分支；
9. 创建或刷新目标为 `main` 的 PR。

同步程序只管理 manifest 中登记的文件，不会删除个人站专属文章。

## 7. 个人站自动验证和合并

PR 创建后，个人站首先运行：

```text
.github/workflows/validate-shared-articles.yml
```

验证内容：

1. 安装依赖；
2. 对文章加载器、文章页和 sitemap 执行 ESLint；
3. 执行个人站生产构建。

验证成功后，个人站运行：

```text
.github/workflows/auto-merge-shared-articles.yml
```

自动合并前必须同时满足：

- PR 状态仍为 open；
- 来源仓库是个人站自身；
- 来源分支是 `automation/sync-blog-articles`；
- 目标分支是 `main`；
- PR 当前提交与通过验证的提交 SHA 完全一致；
- 变更文件仅包含：
  - `content/.article-sync-manifest.json`
  - `content/shared/**`
  - `public/article-assets/**`

全部通过后执行 squash merge，并删除临时同步分支。

验证失败、SHA 变化、来源不符或夹带其他文件时，PR 会保留，不会自动合并。普通功能 PR 不受此流程影响。

## 8. 手动发布个人服务器

自动合并只更新个人站 GitHub `main`，不会连接或重启服务器。

先同步本地仓库：

```bash
cd /Users/bytedance/personal/allenwei-website
git pull --ff-only origin main
```

只有文章和 manifest 变化时，使用内容发布：

```bash
./deploy/publish.sh --content-only
```

同时包含代码、依赖或共享渲染包变化时，执行完整发布：

```bash
KART_SSH_KEY=/path/to/kart_deploy_ed25519 ./deploy/publish.sh
```

发布脚本默认不会删除服务器上本地不存在的文章。只有明确需要镜像清理时才使用 `--prune`。

## 9. 修改和下架

### 修改共享文章

只修改博客仓库中的源 Markdown，验证并推送。同步、PR、验证和合并会自动完成。

### 只从个人站下架

将文章发布范围改为：

```yaml
publishTo: [blog]
```

### 两个网站同时下架

删除博客仓库中的 Markdown 文件。同步程序只会删除 manifest 管理过的个人站副本。

## 10. 故障定位

| 现象 | 检查位置 |
| --- | --- |
| 博客未更新 | 博客 Actions：`Deploy to GitHub Pages` |
| 没有创建个人站 PR | 博客 Actions：`Sync shared articles to personal website` |
| 同步任务提示缺少凭据 | 博客仓库 Secret：`PERSONAL_REPO_TOKEN` |
| PR 校验失败 | 个人站 Actions：`Validate shared article pull requests` |
| PR 未自动合并 | 个人站 Actions：`Auto-merge validated shared articles` |
| 提示冲突 | 检查个人站共享文件是否被人工修改，或存在未托管同名文件 |
| 个人站 GitHub 已更新但线上未更新 | 手动执行个人服务器发布 |

## 11. 日常最简操作

正常发布一篇共享文章时，维护者只需要：

1. 在博客仓库新增或修改 Markdown；
2. 执行 `npm run sync:articles:check` 和 `npm run build`；
3. 提交并推送博客 `main`；
4. 等待博客部署、个人站同步 PR、校验和自动合并完成；
5. 在需要更新个人站线上内容时执行 `./deploy/publish.sh --content-only`。

除非自动化失败，否则不需要进入个人站仓库手工修改共享文章或点击合并 PR。
