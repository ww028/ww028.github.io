import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArticles, getAllTags } from "@/lib/articles";
import ArticleList from "@/components/ArticleList";

const siteUrl = "https://wwblog.cn";
const authorUrl = "https://allenwei.top";

export const metadata: Metadata = {
  title: "魏微的博客",
  description: "魏微的个人博客，记录生活、思考与实践。",
  openGraph: {
    title: "魏微的博客",
    description: "记录生活、思考与实践",
    url: siteUrl,
    type: "website",
    locale: "zh_CN",
    siteName: "魏微的博客",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "魏微的博客",
  description: "记录生活、思考与实践",
  url: siteUrl,
  author: {
    "@type": "Person",
    name: "魏微",
    url: authorUrl,
  },
};

export default function Home() {
  const articles = getAllArticles();
  const tags = getAllTags();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <Suspense fallback={<div className="animate-pulse">加载中...</div>}>
          <ArticleList
            articles={articles.map(({ slug, title, summary, date, pinned, tags }) => ({
              slug,
              title,
              summary,
              date,
              pinned,
              tags,
            }))}
            tags={tags}
          />
        </Suspense>
      </div>
    </>
  );
}
