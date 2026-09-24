# @ww028/blog-kit — 本地验证版

本包目前标记 `private: true`，防止误发布。版本 `0.1.0-local.1`；未接入包注册表或自动部署。

## 模块边界

- `@ww028/blog-kit/content`：`ArticleContent({ content, id?, className? })`，保留服务端渲染，无浏览器 API。
- `@ww028/blog-kit/headings`：`extractHeadings(markdown)`、`generateHeadingId(text)`、`remarkHeadingIds()`。
- `@ww028/blog-kit/toc`：`TableOfContents({ headings, contentId, title?, className?, rootMargin? })`，独立 `use client` 入口。
- `@ww028/blog-kit/styles.css`：仅 `.blog-kit-content` 和 `.blog-kit-toc*`，没有全局 reset。

宿主提供文章数据、主题 CSS 变量、正文容器 ID、目录外层定位/断点、路由、SEO 与文件读取；包不操作 localStorage，不安装 Header，不维护全站主题。

宿主需在全局样式入口导入包的 styles.css。样式沿用两站既有排版；颜色来自 --foreground、--secondary、--tertiary、--accent、--accent-hover、--surface 和 --font-mono。代码块固定配色沿用旧版 One Dark。无需宿主扫描包内的 Tailwind 类，因为包内样式是普通作用域 CSS；定位 Tailwind 类仍放在宿主 wrapper。

React/React DOM 是 peerDependencies；Markdown 库是正常 dependencies。TypeScript 输出 ESM 与声明文件，不 bundle React；保留目录入口的 use client。

## 标题规则

渲染和目录共用 Markdown AST 规则。h2/h3 的原有简单标题 URL 保留；重复标题添加递增后缀；全符号标题使用 section；代码块中的伪标题不进目录；行内粗体、代码、链接取可见文字；Setext 二级标题同样进入目录。

## 本地命令（在博客仓库根目录）

- `npm install`：连接 workspace。
- `npm run test:blog-kit`：构建并运行 Node 测试。
- `npm run build`：prebuild 会先构建本包，再构建博客。
- `npm pack --workspace @ww028/blog-kit --pack-destination ../allenwei-website/vendor`：生成供另一个仓库验证的实包，不发布到网络。
- 在个人站运行 `npm install ./vendor/ww028-blog-kit-0.1.0-local.1.tgz --save-exact`。

个人站 vendor 包是本地验证快照，不会跟随 workspace 自动改变；改动本包后需要重新 pack、重新安装，再验证两站。正式上线前改成可追踪的注册表版本与依赖升级流程。

## 本批不包含

文章/图片同步、包发布、CI 部署、列表/搜索抽取、评论与阅读量合并、主题/导航闪烁修复。原有第三方组件仍由博客站管理。
