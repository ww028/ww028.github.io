"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  content: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~]/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "");
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export default function TableOfContents({ content }: Props) {
  const [activeId, setActiveId] = useState("");
  const headings = extractHeadings(content);

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
    });

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block fixed top-32 right-[max(1rem,calc((100vw-64rem)/2-16rem))] w-56">
      <div className="rounded-2xl bg-surface/50 backdrop-blur-sm p-4">
        <h4 className="text-xs uppercase tracking-widest font-semibold text-tertiary mb-4">目录</h4>
        <ul className="space-y-1 text-sm">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block py-1 rounded-lg transition-all duration-200 ${
                  heading.level === 3 ? "pl-6 pr-2" : "pl-3 pr-2"
                } ${
                  activeId === heading.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-secondary hover:text-foreground hover:bg-surface"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
