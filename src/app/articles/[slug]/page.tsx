import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import TableOfContents from "@/components/TableOfContents";
import ArticleSidebar from "@/components/ArticleSidebar";
import Giscus from "@/components/Giscus";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "文章未找到 - 魏微" };
  const keywords = [
    article.title,
    "魏微",
    ...article.tags,
  ];
  return {
    title: article.title,
    description: article.summary,
    keywords,
    authors: [{ name: "魏微", url: "https://allenwei.top" }],
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      authors: ["魏微"],
      url: `https://allenwei.top/articles/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://allenwei.top/articles/${article.slug}`,
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
    author: { "@type": "Person", name: "魏微", url: "https://allenwei.top" },
    url: `https://allenwei.top/articles/${article.slug}`,
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
          href="/"
          className="text-sm text-accent hover:opacity-70 transition-opacity mb-8 inline-block"
        >
          ← 返回文章列表
        </Link>
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-tertiary">
            <time>{article.date}</time>
            <span>·</span>
            <span id="busuanzi_container_page_pv">
              阅读 <span id="busuanzi_value_page_pv">0</span> 次
            </span>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
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

        {/* 评论区 */}
        <Giscus
          repo="ww028/ww028.github.io"
          repoId="R_kgDOHkmnig"
          category="Announcements"
          categoryId="DIC_kwDOHkmnis4DGJG6"
        />
      </article>

      {/* 不蒜子阅读量统计脚本 */}
      <script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js" />
    </>
  );
}
