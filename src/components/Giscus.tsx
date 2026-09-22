"use client";

import { useEffect, useRef } from "react";

interface Props {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
}

export default function Giscus({ repo, repoId, category, categoryId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    // 加载 Giscus 脚本
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", getTheme());
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");

    container.appendChild(script);

    // 监听主题变化，动态切换 Giscus 主题
    const observer = new MutationObserver(() => {
      const theme = getTheme();
      const iframe = container.querySelector("iframe.giscus-frame");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme } } },
          "https://giscus.app"
        );
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, [repo, repoId, category, categoryId]);

  return <div ref={containerRef} className="mt-16 pt-8 border-t border-surface" />;
}
