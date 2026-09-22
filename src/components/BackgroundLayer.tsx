"use client";

import { useEffect, useState } from "react";

export default function BackgroundLayer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-colors duration-200"
      style={{
        backgroundColor: isDark ? "#0f0f1a" : "#fefefe",
      }}
    />
  );
}
