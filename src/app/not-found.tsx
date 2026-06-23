import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 md:py-32 animate-fade-in-up">
      <div className="text-8xl md:text-9xl font-bold tracking-tight bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent mb-4">
        404
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
        页面未找到
      </h1>
      <p className="text-secondary text-lg mb-8 max-w-md">
        抱歉，你访问的页面不存在或已被移除。
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-[var(--gradient-start)]/20"
      >
        返回首页
      </Link>
    </div>
  );
}
