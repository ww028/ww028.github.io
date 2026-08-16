import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://allenwei.top";

export const metadata: Metadata = {
  title: {
    default: "魏微 - 全栈开发工程师 | 个人网站",
    template: "%s | 魏微",
  },
  description:
    "魏微，全栈开发工程师，10年Web前端开发经验，曾任职阿里巴巴。专注React、TypeScript、Node.js、等Web技术与云原生领域。",
  metadataBase: new URL(siteUrl),
  keywords: [
    "魏微",
    "前端工程师",
    "全栈开发",
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "阿里巴巴",
    "技术博客",
    "个人网站",
  ],
  authors: [{ name: "魏微", url: siteUrl }],
  creator: "魏微",
  publisher: "魏微",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "魏微的个人网站",
    title: "魏微 - 全栈开发工程师 | 个人网站",
    description:
      "魏微，全栈开发工程师，10年Web前端开发经验，曾任职阿里巴巴。专注React、TypeScript、Node.js等Web技术与云原生领域。",
  },
  twitter: {
    card: "summary_large_image",
    title: "魏微-全栈开发工程师",
    description:
      "魏微，全栈开发工程师，10年Web前端开发经验，曾任职阿里巴巴。专注React、TypeScript、Node.js等Web技术与云原生领域。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // 百度站长平台验证码 — 去百度站长平台添加站点后会给你一个 code，替换下面的值
    // other: { "baidu-site-verification": "你的百度验证码" },
  },
  other: {
    "baidu-site-verification": "请替换为百度站长平台给你的验证码",
    "renderer": "webkit",
    "format-detection": "telephone=no,email=no,address=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl shadow-[0_1px_0_rgba(108,99,255,0.06)] dark:shadow-[0_1px_0_rgba(167,139,250,0.06)]">
          <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-60 transition-opacity">
              魏微
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:opacity-60 transition-opacity">
                首页
              </Link>
              <Link href="/articles" className="text-sm font-medium hover:opacity-60 transition-opacity">
                文章
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-6 pt-28 pb-20 w-full">
          {children}
        </main>
        <footer className="py-12 text-center text-sm text-tertiary">
          <div className="max-w-5xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--gradient-mid)]/20 to-transparent mb-8" />
            © 2026 魏微. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
