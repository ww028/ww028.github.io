import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-static";

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
      url: `${siteUrl}/about`,
      lastModified: new Date(latestDate),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...articleEntries,
  ];
}
