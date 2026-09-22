"use client";

import { useEffect } from "react";

export default function ThemeSync() {
  useEffect(() => {
    const updateBackground = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // 直接用内联样式设置 html 背景，优先级最高，避免任何情况下的白屏闪烁
      document.documentElement.style.backgroundColor = isDark ? "#0f0f1a" : "#fefefe";
      document.documentElement.style.color = isDark ? "#eeeeff" : "#1a1a2e";
    };

    // 初始化时立即设置
    updateBackground();

    // 监听 html class 变化，主题切换时同步更新
    const observer = new MutationObserver(updateBackground);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
