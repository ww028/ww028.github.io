"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  slug: string;
  increment?: boolean;
}

export default function ViewCounter({ slug, increment = true }: Props) {
  const [views, setViews] = useState<number | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (increment && !counted.current) {
      counted.current = true;
      fetch(`/api/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((res) => res.json())
        .then((data) => setViews(data.views))
        .catch(() => {});
    } else {
      fetch(`/api/views?slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((data) => setViews(data.views))
        .catch(() => {});
    }
  }, [slug, increment]);

  if (views === null) return null;

  return (
    <span className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views}
    </span>
  );
}
