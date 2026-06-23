"use client";

import Link from "next/link";
import { useState } from "react";

interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
  pinned: boolean;
  tags: string[];
}

interface Props {
  articles: ArticleMeta[];
  tags: { name: string; count: number }[];
}

export default function ArticleList({ articles, tags }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = articles.filter((article) => {
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.summary.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesTag = !selectedTag || article.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索文章标题、摘要或标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl bg-surface border-none focus:outline-none focus:ring-2 focus:ring-accent/20 transition-shadow placeholder:text-tertiary"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 ${
            selectedTag === null
              ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] text-white shadow-md"
              : "bg-surface text-secondary hover:opacity-70"
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
            className={`px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 ${
              selectedTag === tag.name
                ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] text-white shadow-md"
                : "bg-surface text-secondary hover:opacity-70"
            }`}
          >
            {tag.name}
            <span className="ml-1 opacity-60">{tag.count}</span>
          </button>
        ))}
      </div>

      {/* Article list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-center text-tertiary py-12">没有找到匹配的文章</p>
        ) : (
          filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block p-6 rounded-2xl bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight mb-2">
                    {article.pinned && (
                      <span className="inline-block text-xs font-medium bg-accent/10 text-accent px-2.5 py-0.5 rounded-full mr-2 align-middle">
                        置顶
                      </span>
                    )}
                    {article.title}
                  </h2>
                  <p className="text-secondary text-sm mb-2">
                    {article.summary}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-surface text-tertiary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-tertiary shrink-0 mt-1">
                  <time>{article.date}</time>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
