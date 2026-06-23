# UI 重设计方案：Apple 高科技风格

## 背景

当前网站使用标准博客样式（边框卡片、蓝色强调色、基础圆角），需要升级为苹果官网风格的高科技感设计——大量留白、磨砂玻璃效果、精致阴影、大字体层次、微交互动画。

## 设计方向

- 去边框化：用阴影和背景色差替代边框
- 磨砂玻璃（Glassmorphism）：半透明背景 + backdrop-blur
- 大字体层次：首页标题从 3xl 升到 5xl~7xl，tracking-tight
- 苹果配色：`#0071e3` 蓝色强调、`#fbfbfd` 浅底、纯黑暗色模式
- 微动画：fade-in-up 入场动画、hover 浮起效果
- 更大圆角：rounded-2xl 替代 rounded-lg

## 修改文件清单

### 1. `src/app/globals.css`
- 更新 CSS 变量：背景 `#fbfbfd`/`#000000`，前景 `#1d1d1f`/`#f5f5f7`，强调色 `#0071e3`/`#2997ff`
- 新增 `--secondary`、`--tertiary`、`--surface`、`--card`、`--card-shadow` 变量
- 新增 `@keyframes fade-in-up / fade-in` 动画和对应 class
- `.article-content` 去除 h2 底部边框，圆角化代码块(rounded-2xl)，blockquote 加背景色，hr 用渐变线
- 所有固定颜色改用 CSS 变量

### 2. `src/app/layout.tsx`
- Header：去 border-b，改 `bg-white/70 dark:bg-black/70 backdrop-blur-xl`，加微弱阴影
- Nav 链接：hover 改为 opacity 变化
- Main：`max-w-4xl` → `max-w-5xl`，`pt-28 pb-20`
- Footer：去 border-t，改淡色渐变分隔线，`py-12`

### 3. `src/app/page.tsx`
- Hero 区域：居中布局，头像加发光模糊背景，名字 `text-5xl md:text-7xl tracking-tight`
- 联系方式改为圆角 pill 徽章
- 技能区：改为 2x3 卡片网格（数字 + 名称），背景用 surface 色
- 文章区：居中标题+副标题，底部「查看全部」改为苹果风格 pill 按钮
- 各 section 加 `animate-fade-in-up`

### 4. `src/components/ArticleList.tsx`
- 搜索框：去边框，`bg-[var(--surface)] rounded-2xl`
- 标签 pill：inactive 用 surface 背景
- 文章卡片：去 border，改 `rounded-2xl shadow-[var(--card-shadow)]`，hover 浮起 + 加深阴影

### 5. `src/components/TableOfContents.tsx` & `ArticleSidebar.tsx`
- 外层加 `rounded-2xl bg-[var(--surface)]/50 backdrop-blur-sm p-4`
- 标题改为 `text-xs uppercase tracking-widest`
- Active 状态改为强调色文字 + 圆角背景高亮

### 6. `src/components/ThemeToggle.tsx`
- `rounded-full`，hover `scale-110`，active `scale-95`

## 验证方式

1. `pnpm dev` 启动开发服务器
2. 浏览首页确认大标题、发光头像、卡片网格效果
3. 进入文章详情页检查语法高亮、TOC、侧边栏磨砂效果
4. 切换暗色模式确认所有变量正确切换
5. 缩小窗口确认响应式布局正常（侧边栏隐藏、字体缩小等）
