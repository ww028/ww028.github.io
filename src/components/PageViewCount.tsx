"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const BUSUANZI_SRC = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";

function loadBusuanzi() {
  // 先移除旧的脚本，避免重复加载
  const oldScript = document.getElementById("busuanzi-script");
  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement("script");
  script.id = "busuanzi-script";
  script.src = BUSUANZI_SRC;
  script.async = true;
  document.body.appendChild(script);
}

export default function PageViewCount() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoaded(false);

    // 先重置内容为 0，避免显示上一篇文章的数字
    const valueEl = containerRef.current?.querySelector("#busuanzi_value_page_pv");
    if (valueEl) {
      valueEl.textContent = "0";
    }

    // 重新加载不蒜子脚本
    loadBusuanzi();

    const container = containerRef.current;
    if (!container) return;

    const targetEl = container.querySelector("#busuanzi_value_page_pv");
    if (!targetEl) return;

    // 监听内容变化，不蒜子加载完数字后会更新 textContent
    const observer = new MutationObserver(() => {
      const text = targetEl.textContent?.trim();
      if (text && text !== "0" && text !== "") {
        setLoaded(true);
      }
    });

    observer.observe(targetEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // 超时兜底：3秒后无论有没有数字都显示
    const timeout = setTimeout(() => setLoaded(true), 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [pathname]);

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
