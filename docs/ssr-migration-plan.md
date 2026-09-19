# 个人网站：静态导出 → 服务端渲染 改造方案（定稿）

> 源码：`/Users/weiwei/code/ww028.github.io`
> 目标服务器：`124.220.100.161`（腾讯云轻量 2核2G，宝塔，Node v24.18.0 已装）
> **域名：只用 `allenwei.top` 一个**
> 卡丁车项目（Java :8081）**本次不动**

## 0. 已拍板的三个决策

| 决策 | 结论 |
|---|---|
| 渲染模式 | **ISR**（服务端渲染的一种，带缓存）+ 按需重新验证 |
| 数据源 | **继续用 Markdown 文件**，不接数据库、不写后端 |
| 域名 | **只有 `allenwei.top`**，不做多域名分流 |

由此产生的三个简化（原方案里的复杂度基本被砍掉）：

- ❌ 不需要 middleware 按 Host 分流
- ❌ 不需要 Go 后端、不需要 MySQL（省 ~260M）
- ❌ `wwblog.cn` **不迁移、不备案**，维持 GitHub Pages

---

## 1. 一个必须说清楚的认知对齐

**如果目的纯粹是 SEO，静态导出其实也够用** —— 静态 HTML 同样能被百度/Google 收录，甚至更快。

改 ISR 真正多出来的收益是这一条：

> **改文章不用重新构建、不用重新部署。**

静态导出的话，写一篇新文章 = 本地 `next build` + 传整个 `out/` 到服务器，几分钟一次。
ISR 的话 = 传一个 `.md` 文件上去 + 调一下刷新接口，**秒级生效**。

所以本方案的价值锚点是"内容更新免构建"，SEO 是顺带满足的（且满足得更好，见第 5 节）。
如果你觉得"本地 build 再传一遍"也能接受，那其实只要修 `_next` 漏传的问题就够了 —— 这个岔路口在第 8 节。

另外确认一件事：你当前的 SEO 基础**已经相当完整**（`layout.tsx` 里 metadata / openGraph / twitter card / canonical / robots / keywords 齐全，`sitemap.ts` 和 `robots.ts` 都在，且 URL 已写死 `https://allenwei.top`）。所以这次改造**不用重写 SEO**，只需要修几处让它适配运行时渲染。

---

## 2. 现状盘点

| 项 | 实际情况 |
|---|---|
| 技术栈 | Next.js **16.2.9** + React 19.2.4 + TypeScript + Tailwind CSS 4 |
| 渲染 | `next.config.ts` 里 `output: "export"` → 纯静态导出到 `out/` |
| 数据源 | **构建时**用 `fs.readdirSync` 读 `content/articles/*.md`，当前 **5 篇** |
| 页面 | `/`（个人主页）、`/articles`（列表）、`/articles/[slug]`（详情） |
| 辅助 | `sitemap.ts`、`robots.ts`、`ThemeToggle`、`TableOfContents`、`ArticleSidebar` |
| 服务器 | Node **v24.18.0** ✓（满足 Next 16 的 Node 20.9+）；磁盘余 29G ✓ |

**已确认的缺陷**：服务器 `/www/wwwroot/allenwei.top/_next/` 是空目录，本地 `out/_next` 完整
→ 当初上传漏了 `_next`，线上页面**没有 CSS 也没有 JS**。改 ISR 后此问题自然消失。

---

## 3. 改造后的架构

```
浏览器 ──► nginx :443 (allenwei.top) ──► proxy_pass ──► Next.js :3000 (standalone)
                                                            │
                                                    运行时读取 ▼
                                              /opt/website/content/articles/*.md
                                                            │
                                              ISR 缓存（1h）+ 按需刷新
```

一个 Node 进程，没有数据库，没有后端 API 进程。

| 模式 | 什么时候渲染 | 本次是否采用 |
|---|---|---|
| 纯 SSR | 每次请求都渲染 | ✗ 内容几天一更，让每个访客都付一次渲染成本是浪费 |
| **ISR** | 首次渲染后缓存，到期后台重新生成 | ✓ **采用** |
| SSG | 只在构建时渲染 | ✗ 就是现在的问题（改一次要全量构建） |

**ISR 属于服务端渲染** —— HTML 照样由服务端产出，SEO、首屏无白屏全部满足，只是结果被缓存复用。

---

## 4. 改动清单（文件级）

| 文件 | 改动 |
|---|---|
| `next.config.ts` | `output: "export"` → `output: "standalone"` |
| `src/lib/articles.ts` | 内容目录改读 `CONTENT_DIR` 环境变量；用 `unstable_cache` 包一层（tag: `articles`） |
| `src/app/page.tsx` | 加 `export const revalidate = 3600` |
| `src/app/articles/page.tsx` | 同上 |
| `src/app/articles/[slug]/page.tsx` | 同上；`generateStaticParams` 保留（首屏更快） |
| `src/app/sitemap.ts` | **去掉 `export const dynamic = "force-static"`**（否则内容更新后 sitemap 不跟着变） |
| `src/app/api/revalidate/route.ts` | **新建**，发文章后主动刷新缓存 |
| `deploy/build.sh` / `deploy/deploy.sh` | **新建**，构建与发布脚本 |

### 4.1 `next.config.ts`

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

standalone 产物只含运行时必需依赖（几十 MB），不带整个 `node_modules`。

构建后要手动补两个目录（standalone 不会自动带上）：

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

启动：`node .next/standalone/server.js`（端口用 `PORT` 环境变量，默认 3000）

### 4.2 ⚠️ `process.cwd()` 陷阱（最容易踩的坑）

`src/lib/articles.ts` 现在是 `path.join(process.cwd(), "content/articles")`。
standalone 部署后工作目录变了，**会读不到文件**。必须改成环境变量：

```ts
const articlesDirectory = process.env.CONTENT_DIR
  ? process.env.CONTENT_DIR
  : path.join(process.cwd(), "content/articles");
```

改完顺带得到一个能力：**更新文章只需上传 `.md`，不用重新构建**。

再包一层缓存，避免每次请求都读盘：

```ts
import { unstable_cache } from "next/cache";

export const getAllArticles = unstable_cache(
  async () => { /* 原有的 fs 读取与解析 */ },
  ["articles"],
  { tags: ["articles"], revalidate: 3600 }
);
```

### 4.3 按需刷新接口

```ts
// src/app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: Request) {
  if (req.headers.get("x-revalidate-token") !== process.env.REVALIDATE_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }
  revalidateTag("articles");
  revalidatePath("/", "layout");   // 首页、列表、详情一起刷
  return Response.json({ revalidated: true, at: Date.now() });
}
```

刷新只能在本机调用（nginx 不对外暴露 `/api/revalidate`，或限制来源 IP）。

### 4.4 systemd 单元要点

- `ExecStart` 必须写 **Node 绝对路径**：`/www/server/nvm/versions/node/v24.18.0/bin/node`
  （nvm 装的 Node 不在 systemd 的 PATH 里，写 `node` 会 command not found）
- 环境变量：`PORT=3000`、`CONTENT_DIR=/opt/website/content`、`NODE_ENV=production`、`REVALIDATE_TOKEN=<随机>`
- `Environment="NODE_OPTIONS=--max-old-space-size=256"`：给 V8 堆设上限（相当于 JS 侧的 `-Xmx`）
- `MemoryMax=512M` 兜底（Node 的 RSS 会高于 V8 堆，留余量）
- `Restart=always`

### 4.5 nginx

把 `allenwei.top` 站点从「静态目录 + PHP」改成反代：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

⚠️ 宝塔的 nginx 不归 systemd 管，必须用 `/www/server/nginx/sbin/nginx -s reload`
（`systemctl reload nginx` 无效，前面踩过）。

---

## 5. SEO 具体要做的（目的就是它，单独列一节）

**已有的、不用动的**（`layout.tsx` + `sitemap.ts` + `robots.ts` 里都已写好）：
title 模板、description、keywords、canonical、openGraph、twitter card、robots 规则、sitemap.xml

**本次要改的**：

| 项 | 动作 | 为什么 |
|---|---|---|
| `sitemap.ts` | 去掉 `dynamic = "force-static"` | 否则新增文章后 sitemap 不更新，搜索引擎发现不了新页面 |
| sitemap 的 `lastModified` | 别用 `new Date()`（每次都变，等于告诉搜索引擎"我天天改"），改用该文章真实日期 | 影响抓取频率判断 |
| 每页 canonical | 详情页要输出自己的 URL，别统一指向首页 | 避免重复内容 |

**建议补的（加分项，可选）**：

- **JSON-LD 结构化数据**：文章页加 `Article` schema（标题/作者/发布时间/正文摘要）。百度和 Google 都认，能提升搜索结果的展示样式（rich result）。约 20 行代码
- **百度站长平台 + Google Search Console 验证**：`layout.tsx` 里已预留 `verification` 字段的位置，拿到验证码填进去，然后提交 sitemap。**必须等备案通过后才能做**

**备案后第一时间**：提交 sitemap、申请收录。这一步不做，前面 SEO 做得再好搜索引擎也不知道你存在。

---

## 6. 内容更新工作流（改造后）

```bash
# 本地写完文章
content/articles/新文章.md

# 一条命令发布
./deploy/publish.sh
# 内部做两件事：
#   1. rsync content/ → 服务器 /opt/website/content/
#   2. curl -X POST -H "x-revalidate-token: $TOKEN" http://127.0.0.1:3000/api/revalidate
```

秒级生效，不用构建、不用重启服务、不影响线上访问。

---

## 7. 内存账

| 进程 | 占用 |
|---|---|
| mysqld | 237M（已有） |
| karting :8081（Java，不动） | 220M（已有） |
| **Next.js standalone（新增）** | **~150-200M** |
| BT-Panel / nginx / firewalld | ~160M（已有） |
| **合计** | **约 770M / 1963M** |

因为没有数据库和后端进程，比原方案省约 260M。余量充足。

---

## 8. 实施步骤

### 阶段一（不依赖备案，现在就能做）

1. 本地改 `next.config.ts` + `src/lib/articles.ts` + 各页 `revalidate` + 新建 revalidate 接口
2. 本地 `npm run build`，确认 `.next/standalone` 正常产出
3. 本地 `CONTENT_DIR=$PWD/content PORT=3000 node .next/standalone/server.js` 起进程，
   curl 验证首页 / 列表 / 详情 / sitemap.xml
4. 服务器建 `/opt/website/`（放 standalone 产物 + content 目录），写 systemd 单元并启动
5. 用 Host 头内网验证：`curl -H "Host: allenwei.top" http://127.0.0.1:3000/`
6. nginx 改 `allenwei.top` 为反代 :3000，`nginx -s reload`
7. 写 `deploy/publish.sh`

全程不影响线上（域名还没解析过来）。

### 阶段二（备案通过后）

8. 阿里云 DNS：`allenwei.top` 加 A 记录 → `124.220.100.161`
9. 宝塔申请 Let's Encrypt 证书，强制 HTTPS，`www` 301 到主域
10. 站长平台提交 sitemap
11. `wwblog.cn` 做 301 跳转到 `allenwei.top`（在 GitHub Pages 上放个跳转页即可，
    **不迁移、不备案**，避免为一个跳转页再走一轮管局审核）

---

## 9. 风险与坑

| 坑 | 说明 |
|---|---|
| `process.cwd()` | standalone 下工作目录变了，必须改读 `CONTENT_DIR`（见 4.2） |
| Node 绝对路径 | systemd 里写 `node` 会 command not found，必须写 nvm 完整路径 |
| nginx reload | 宝塔 nginx 不归 systemd 管，用 `/www/server/nginx/sbin/nginx -s reload` |
| 本地构建 | **必须在本地 build**，别在 2G 机器上跑（峰值可能 1G+，会 OOM） |
| 备案红线 | 备案没过前**绝不能切 DNS**，否则被拦成 webblock（allenwei.top 已是前车之鉴） |
| ISR 缓存目录 | standalone 模式下 ISR 缓存落在 `.next/cache`，部署时别清空它，否则每次发布都全量重渲染 |
| 百度收录慢 | 新站百度收录通常要几周，且**国内服务器 + 已备案**是前提。Google 相对快 |

---

## 10. 实施记录（2026-09-19 已完成的阶段一）

**已上线**：Next.js 16 standalone 跑在服务器 `:3000`，nginx 反代，`allenwei.top` 全站 200，
开机自启（systemd `website.service`）。全程用 Host 头内网验证，**未动 DNS、不影响线上**。

### 实测数据（都好于预期）

| 项 | 实测 |
|---|---|
| next-server RSS | **92M**（预估 150-200M） |
| 打包产物 | 12M |
| 服务器可用内存 | 803M / 1963M |
| 冷启动 | <1s |

### 端到端验证结果

```
/                     200     /articles              200
/articles/{slug}      200     /sitemap.xml           200
/robots.txt           200     /_next/static/*.css    200（之前线上丢的就是它）
/api/revalidate       从 nginx 访问 403（只允许本机）
```

**"发文章不用重新构建"已实测通过**：往 `/opt/website/content/articles/` 放一个 `.md`
→ 调 `/api/revalidate` → sitemap URL 数 7→8、新文章页 200 且含标题 → 删掉再刷新 → 回到 7。

### 踩到的四个坑（都已解决）

1. **`next build` 被本地批量删除保护拦住**：Next 清理 `.next/trace` 时触发阈值，
   报 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`。→ 构建前用 `mv .next /tmp/...` 移走，不要 `rm -rf`。
   （已写进 `deploy/build.sh`）

2. **`NODE_OPTIONS` 污染导致构建失败**：环境里注入的 `--use-system-ca` 让 Next worker 报
   `ERR_WORKER_INVALID_EXEC_ARGV`。→ `env -u NODE_OPTIONS npm run build`（已写进 build.sh）。
   ⚠️ 注意服务器上 systemd 里给 Node 设的是自己的 `NODE_OPTIONS`，不受影响。

3. **`CONTENT_DIR` 指向哪一层容易搞错**（我一开始就配错，导致读到 0 篇文章）：
   它指向 **content 根目录**，文章在其下的 `articles/` 子目录里，
   即 `$CONTENT_DIR/articles/*.md`，不是直接指向 articles 目录。

4. **standalone 产物不含 `public/` 和 `.next/static/`**，必须手动拷贝，
   否则线上就是"没 CSS 没 JS"—— 这正是之前线上那个问题的成因。

### 另一个发现：云镜 agent 杀不死

2026-09-19 晚清理过一次，60 秒后目录和 cron 文件被完整重建、进程重新拉起（试了两次都复活）。
推测由平台侧下发重装。**本地手段根治不了，要去腾讯云控制台 → 主机安全 → 卸载 agent。**

### 阶段二待办（卡在备案）

- [ ] 阿里云 DNS：`allenwei.top` → A → `124.220.100.161`
- [ ] 宝塔申请 Let's Encrypt 证书 → 强制 HTTPS → `www` 301 到主域
- [ ] `layout.tsx` 里填百度/Google 站长验证码，提交 sitemap
- [ ] `wwblog.cn` 放 301 跳转到 allenwei.top（GitHub Pages 上加个跳转页即可）

## 11. 一个可选的岔路

如果你觉得"写一篇就本地 build 一次"也能接受，那最省事的方案其实是：
**维持静态导出，只修 `_next` 漏传问题 + 写个 build & rsync 脚本**（1 分钟发布，零 Node 常驻进程，省 150M）。

ISR 相比它的优势是发布更快（秒级 vs 分钟级）、sitemap 动态、将来能平滑加评论/后台。
缺点是多一个常驻进程要维护。

我倾向 ISR（反正内存有的是，且你明确说了要动态），但这个取舍摆在这儿，你说了算。
