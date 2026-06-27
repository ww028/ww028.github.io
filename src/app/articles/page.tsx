import Link from "next/link";
import { getAllArticles, getAllTags } from "@/lib/articles";
import type { Metadata } from "next";
import ArticleList from "@/components/ArticleList";

export const metadata: Metadata = {
  title: "文章列表",
  description: "魏微的技术博客文章，涵盖前端开发、TypeScript、React、Docker 等主题",
  openGraph: {
    title: "文章列表 - 魏微的个人网站",
    description: "魏微的技术博客文章，涵盖前端开发、TypeScript、React、Docker 等主题",
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const tags = getAllTags();

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 animate-fade-in-up bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">所有文章</h1>
      <ArticleList
        articles={articles.map(({ content, ...rest }) => rest)}
        tags={tags}
      />
    </div>
  );
}
