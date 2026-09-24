# SEO 优化 TODO

目标：提高搜索“魏微”及相关组合词时，个人网站与博客被正确识别、收录和展示的概率。

> 说明：搜索排名由搜索引擎综合决定，无法保证进入前五。本清单按可控性和预期收益排序。

## P0：博客域名迁移

- [x] GitHub Pages 自定义域名设置为 `wwblog.cn`
- [x] 修正 `www.wwblog.cn` 的 CNAME 并指向 `ww028.github.io`
- [x] 开启 GitHub Pages Enforce HTTPS
- [x] 博客 `metadataBase` 改为 `https://wwblog.cn`
- [x] 博客首页 canonical、Open Graph 和 JSON-LD 改为 `https://wwblog.cn`
- [x] 博客文章 canonical、Open Graph、JSON-LD 与 `mainEntityOfPage` 改为 `https://wwblog.cn`
- [x] 博客 sitemap URL 改为 `https://wwblog.cn`
- [x] 博客 robots 中的 sitemap 地址改为 `https://wwblog.cn/sitemap.xml`
- [x] 个人站共享文章 canonical 改为 `https://wwblog.cn/articles/<slug>`
- [x] 删除博客中无效的百度验证占位值
- [x] 部署后确认 `https://wwblog.cn` 正常访问
- [x] 部署后确认 `https://www.wwblog.cn` 跳转到 `https://wwblog.cn`
- [x] 部署后确认 `https://ww028.github.io` 跳转到 `https://wwblog.cn`
- [x] 检查博客首页和文章页最终 HTML 中 canonical、`og:url`、JSON-LD 均使用 `wwblog.cn`
- [x] 检查 `https://wwblog.cn/sitemap.xml` 和 `https://wwblog.cn/robots.txt`

## P1：建立“魏微”人物实体

- [ ] 将个人站首页结构化数据升级为 `ProfilePage`
- [ ] 为人物建立稳定 ID：`https://allenwei.top/#person`
- [ ] `mainEntity` 使用 `Person`
- [ ] 统一姓名 `魏微` 与英文名 `Wei Wei`
- [ ] 添加真实、稳定的人物简介
- [ ] 添加可公开抓取的真实头像
- [ ] `sameAs` 至少关联 GitHub 与 `https://wwblog.cn`
- [ ] 博客首页、About 页和所有文章作者统一引用同一个 Person ID
- [ ] 个人站所有文章作者统一引用同一个 Person ID
- [ ] 用 Google Rich Results Test 验证结构化数据
- [ ] 检查个人站首页只保留一个语义 `<h1>`；装饰性“魏”不使用标题标签

## P1：两站定位与互链

- [ ] 个人站首页 title 调整为清晰、稳定的姓名品牌标题
- [ ] 个人站首页 description 聚焦“魏微是谁、作品与文章”
- [ ] 博客首页 title 调整为“魏微的博客｜生活、思考与实践”或最终确认文案
- [ ] 博客 About 页增加“关于魏微”的明确标题和稳定简介
- [ ] 个人站增加指向博客的链接，锚文本使用“魏微的博客”
- [ ] 博客增加指向个人站的链接，锚文本使用“魏微的个人网站”
- [ ] 文章页增加统一作者信息与个人主页入口

## P1：Google Search Console

- [ ] 添加并验证 Domain Property：`allenwei.top`
- [ ] 添加并验证 Domain Property：`wwblog.cn`
- [ ] 提交 `https://allenwei.top/sitemap.xml`
- [ ] 提交 `https://wwblog.cn/sitemap.xml`
- [ ] URL Inspection 检查两个首页
- [ ] URL Inspection 检查博客 About 页
- [ ] URL Inspection 检查至少两篇代表文章
- [ ] 请求重新编入索引
- [ ] 确认 Google 选择的 canonical 与站点声明一致
- [ ] 查看结构化数据和抓取错误报告

## P1：百度搜索资源平台

- [ ] 添加并验证 `https://allenwei.top`
- [ ] 添加并验证 `https://wwblog.cn`
- [ ] 将真实百度验证码配置到对应站点；未配置时不输出 meta
- [ ] 提交两个站点的 sitemap
- [ ] 提交首页、作者页和重点文章链接
- [ ] 使用抓取诊断检查首页和文章页
- [ ] 查看索引量、抓取异常和死链报告
- [ ] 评估百度抓取 GitHub Pages 的稳定性

## P2：公开身份一致性

- [ ] GitHub Profile 使用姓名“魏微”并链接 `allenwei.top`
- [ ] GitHub Profile 同时展示博客 `wwblog.cn`
- [ ] 重要开源项目 README 增加真实作者主页链接
- [ ] 在实际使用的公开平台统一姓名、英文名、头像和简介
- [ ] 只关联真实维护的公开主页，不批量创建低质量账号

## P2：内容与站内链接

- [ ] 形成“工程实践、独立开发、个人思考”三条稳定内容线
- [ ] 持续补充具有真实经验和独特结论的原创文章
- [ ] 每篇文章提供清晰标题、摘要、作者与发布日期
- [ ] 对发生实质更新的文章记录更新时间
- [ ] 为文章增加相关文章内链
- [ ] 图片使用准确的 alt 文本
- [ ] 定期更新或下架过时内容
- [ ] 避免关键词堆砌和模板化低价值文章

## P2：监测与复盘

- [ ] 每月记录“魏微”的展示次数、点击数、点击率与平均排名
- [ ] 同时监测“魏微 博客”“魏微 独立开发”“魏微 全栈开发”等组合词
- [ ] 分别记录 Google 与百度的收录页面数
- [ ] 发现标题点击率偏低时，基于数据调整 title 和 description
- [ ] 发现 canonical 异常时优先处理重复 URL 和重定向
- [ ] 每季度复查失效链接、结构化数据错误与 sitemap

## 不做事项

- [ ] 不购买低质量外链
- [ ] 不堆砌“魏微”关键词
- [ ] 不依赖 `meta keywords` 提升 Google 排名
- [ ] 不在两个仓库人工维护同一份共享文章
- [ ] 不频繁更换博客主域名
- [ ] 不把索引提交误认为排名保证
