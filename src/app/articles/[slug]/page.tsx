import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import ViewCounter from "@/components/ViewCounter";
import TableOfContents from "@/components/TableOfContents";
import ArticleSidebar from "@/components/ArticleSidebar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "文章未找到" };
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      authors: ["张三"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    author: { "@type": "Person", name: "张三", url: "https://zhangsan.dev" },
    url: `https://zhangsan.dev/articles/${article.slug}`,
  };

  const allArticles = getAllArticles().map(({ slug, title, pinned }) => ({ slug, title, pinned }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleSidebar articles={allArticles} />
      <TableOfContents content={article.content} />
      <article className="max-w-none animate-fade-in-up xl:max-w-3xl xl:mx-auto">
        <Link
          href="/articles"
          className="text-sm text-accent hover:opacity-70 transition-opacity mb-8 inline-block"
        >
          ← 返回文章列表
        </Link>
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-tertiary">
            <time>{article.date}</time>
            <ViewCounter slug={article.slug} />
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-surface text-secondary hover:bg-accent/10 hover:text-accent transition-all duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>
        <div className="article-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h2: ({ children }) => {
                const text = String(children).replace(/[`*_~]/g, "");
                const id = generateHeadingId(text);
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const text = String(children).replace(/[`*_~]/g, "");
                const id = generateHeadingId(text);
                return <h3 id={id}>{children}</h3>;
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
}
