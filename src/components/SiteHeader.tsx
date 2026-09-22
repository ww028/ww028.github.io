"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateHidden = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // 滚动到顶部，强制显示
      if (currentY < 80) {
        setHidden(false);
      } else {
        // 向下滚动超过阈值 → 隐藏
        if (delta > 8) {
          setHidden(true);
        }
        // 向上滚动 → 显示
        else if (delta < -8) {
          setHidden(false);
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(updateHidden);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl shadow-[0_1px_0_rgba(108,99,255,0.06)] dark:shadow-[0_1px_0_rgba(167,139,250,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-60 transition-opacity">
          魏微
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:opacity-60 transition-opacity">
            博客
          </Link>
          <Link href="/about" className="text-sm font-medium hover:opacity-60 transition-opacity">
            关于
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
