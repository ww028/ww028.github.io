"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ArticleMeta {
  slug: string;
  title: string;
  pinned: boolean;
}

interface Props {
  articles: ArticleMeta[];
}

export default function ArticleSidebar({ articles }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden xl:block fixed top-28 left-[max(1rem,calc((100vw-64rem)/2-16rem))] w-56 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="rounded-2xl bg-surface/50 backdrop-blur-sm p-4">
        <h4 className="text-xs uppercase tracking-widest font-semibold text-tertiary mb-4">文章列表</h4>
        <ul className="space-y-0.5 text-sm">
          {articles.map((article) => {
            const isActive = pathname === `/articles/${article.slug}`;
            return (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className={`block py-1.5 px-2.5 rounded-lg transition-all duration-200 truncate ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-secondary hover:text-foreground hover:bg-surface"
                  }`}
                  title={article.title}
                >
                  {article.pinned && <span className="mr-1">📌</span>}
                  {article.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
