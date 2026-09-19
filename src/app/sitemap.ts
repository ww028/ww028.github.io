import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

// 原来是 dynamic = "force-static"：sitemap 在构建时生成后永不更新，
// 新增文章后它不会变化，搜索引擎就发现不了新页面。
// 改成和普通页面一样的 ISR：缓存 1 小时，发文章时由 /api/revalidate 主动刷新。
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://allenwei.top";
  const articles = getAllArticles();

  // 首页/列表页的 lastModified 取"最新一篇文章的日期"，不用 new Date()。
  // 用 new Date() 等于每次生成都告诉搜索引擎"我刚刚改过"，会误导抓取频率判断。
  // 注意 articles 是按置顶再按日期排序的，所以取最大值而不是第一项。
  const latestDate = articles.reduce(
    (max, article) => (article.date > max ? article.date : max),
    articles[0]?.date ?? "2026-01-01"
  );

  const articleEntries = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(latestDate),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(latestDate),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articleEntries,
  ];
}
