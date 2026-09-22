import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
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
    default: "魏微的博客",
    template: "%s | 魏微的博客",
  },
  description:
    "魏微的个人博客，记录生活、思考与实践。",
  metadataBase: new URL(siteUrl),
  keywords: [
    "博客",
    "个人博客",
    "魏微",
  ],
  authors: [{ name: "魏微", url: siteUrl }],
  creator: "魏微",
  publisher: "魏微",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "魏微的博客",
    title: "魏微的博客",
    description: "记录生活、思考与实践",
  },
  twitter: {
    card: "summary_large_image",
    title: "魏微的博客",
    description: "记录生活、思考与实践",
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
        <SiteHeader />
        <main className="flex-1 max-w-5xl mx-auto px-6 pt-28 pb-20 w-full">
          {children}
        </main>
        <footer className="py-12 text-center text-sm text-tertiary">
          <div className="max-w-5xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--gradient-mid)]/20 to-transparent mb-8" />
            © 2026 魏微的博客. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
