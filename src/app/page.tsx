import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

const skills = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Node.js", level: 85 },
  { name: "Python", level: 80 },
  { name: "Docker / K8s", level: 75 },
  { name: "PostgreSQL / Redis", level: 80 },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "魏微",
  url: "https://allenwei.top",
  jobTitle: "资深前端工程师",
  description: "10 年 Web 前端开发经验，曾任职阿里巴巴集团，后投身创业，具备完整的产品从 0 到 1 落地能力",
  address: { "@type": "PostalAddress", addressLocality: "北京", addressCountry: "CN" },
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Python", "Docker", "Kubernetes"],
};

export default function Home() {
  const articles = getAllArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-24">
        {/* Hero */}
        <section className="flex flex-col items-center text-center py-16 md:py-24 animate-fade-in-up">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] blur-3xl opacity-25 scale-150" />
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-lg">
              魏
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">魏微</h1>
          <p className="text-xl md:text-2xl font-medium text-secondary mb-6">
            资深前端工程师 · Vibe Coding 爱好者
          </p>
          <p className="text-base md:text-lg text-secondary leading-relaxed max-w-2xl mb-8">
            10 年 Web 前端开发经验，近 2 年深耕全栈开发。<br />
            曾任职阿里巴巴集团。<br />
            两年创业经历，独立负责产品评估设计、全栈开发、测试上线及运维部署，具备完整的产品闭环能力。<br />
            自驱力强，Vibe Coding 爱好者，拥抱变化。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">📍 上海</span>
            <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">📧 wwjobs@163.com</span>
            <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">🔗 github.com/ww028</span>
          </div>
        </section>

        {/* Skills */}
        <section className="animate-fade-in-up stagger-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">专业技能</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="p-6 rounded-2xl bg-surface text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)]"
              >
                <div className="text-3xl font-bold tracking-tight text-accent mb-2">
                  {skill.level}%
                </div>
                <div className="text-sm font-medium text-secondary">{skill.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Articles */}
        <section className="animate-fade-in-up stagger-2">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">最新文章</h2>
            <p className="text-secondary">探索技术世界的最新思考</p>
          </div>
          <div className="space-y-4">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block p-6 rounded-2xl bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold tracking-tight mb-1">
                      {article.pinned && (
                        <span className="inline-block text-xs font-medium bg-accent/10 text-accent px-2.5 py-0.5 rounded-full mr-2 align-middle">
                          置顶
                        </span>
                      )}
                      {article.title}
                    </h3>
                    <p className="text-sm text-secondary">
                      {article.summary}
                    </p>
                  </div>
                  <time className="text-xs text-tertiary shrink-0">
                    {article.date}
                  </time>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/articles"
              className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] text-white font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-[var(--gradient-start)]/20"
            >
              查看全部文章
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
