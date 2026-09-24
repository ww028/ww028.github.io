"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./headings.js";

export interface TableOfContentsProps {
  headings: readonly TocItem[];
  contentId: string;
  title?: string;
  className?: string;
  rootMargin?: string;
}

/** Placement and breakpoint belong to the host; this module owns only the TOC. */
export function TableOfContents({
  headings,
  contentId,
  title = "目录",
  className = "",
  rootMargin = "-80px 0px -60% 0px",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const content = document.getElementById(contentId);
    if (!content || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      }
    }, { rootMargin });
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el && content.contains(el)) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings, contentId, rootMargin]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={title} className={`blog-kit-toc ${className}`.trim()}>
      <div className="blog-kit-toc__panel">
        <h4 className="blog-kit-toc__title">{title}</h4>
        <ul className="blog-kit-toc__list">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                data-level={heading.level}
                aria-current={activeId === heading.id ? "location" : undefined}
                className="blog-kit-toc__link"
                onClick={(event) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  const target = document.getElementById(heading.id);
                  const content = document.getElementById(contentId);
                  if (!target || !content?.contains(target)) return;
                  event.preventDefault();
                  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  target.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
                }}
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
