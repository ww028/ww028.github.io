import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllArticles, getAllTags } from "@/lib/articles";
import ArticleList from "@/components/ArticleList";

export const metadata: Metadata = {
  title: "魏微的博客",
  description: "魏微的个人博客，记录生活、思考与实践。",
  openGraph: {
    title: "魏微的博客",
    description: "记录生活、思考与实践",
    url: "https://allenwei.top",
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
  url: "https://allenwei.top",
  author: {
    "@type": "Person",
    name: "魏微",
    url: "https://allenwei.top",
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
            articles={articles.map(({ content, ...rest }) => rest)}
            tags={tags}
          />
        </Suspense>
      </div>
    </>
  );
}
