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
    default: "魏微的个人网站",
    template: "%s - 魏微的个人网站",
  },
  description: "全栈开发工程师，专注于 Web 技术和云原生领域，热爱技术与开源",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "魏微的个人网站",
    title: "魏微的个人网站",
    description: "全栈开发工程师，专注于 Web 技术和云原生领域，热爱技术与开源",
  },
  twitter: {
    card: "summary_large_image",
    title: "魏微的个人网站",
    description: "全栈开发工程师，专注于 Web 技术和云原生领域，热爱技术与开源",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
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
