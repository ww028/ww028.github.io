"use client";

import { useEffect, useRef, useState } from "react";

export default function PageViewCount() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const valueEl = container.querySelector("#busuanzi_value_page_pv");
    if (!valueEl) return;

    // 监听内容变化，不蒜子加载完数字后会更新 textContent
    const observer = new MutationObserver(() => {
      const text = valueEl.textContent?.trim();
      if (text && text !== "0" && text !== "") {
        setLoaded(true);
      }
    });

    observer.observe(valueEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // 超时兜底：3秒后无论有没有数字都显示，避免一直空白
    const timeout = setTimeout(() => setLoaded(true), 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      id="busuanzi_container_page_pv"
      className={`inline-block transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
    >
      阅读 <span id="busuanzi_value_page_pv">0</span> 次
    </span>
  );
}
