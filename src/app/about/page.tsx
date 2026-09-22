import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
  description: "关于魏微",
  openGraph: {
    title: "关于我 - 魏微的博客",
    description: "关于魏微",
  },
};

const skills = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Node.js", level: 85 },
  { name: "Python", level: 80 },
  { name: "Docker / K8s", level: 75 },
  { name: "PostgreSQL / Redis", level: 80 },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-12 mb-16 animate-fade-in-up">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] blur-3xl opacity-25 scale-150" />
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-lg">
            魏
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">
          魏微
        </h1>
        <p className="text-xl md:text-2xl font-medium text-secondary mb-6">
          全栈开发工程师 · Vibe Coding 爱好者
        </p>
        <p className="text-base md:text-lg text-secondary leading-relaxed max-w-2xl mb-8">
          10 年 Web 前端开发经验，近 2 年深耕全栈开发。
          <br />
          曾任职阿里巴巴集团。
          <br />
          两年创业经历，独立负责产品评估设计、全栈开发、测试上线及运维部署，具备完整的产品闭环能力。
          <br />
          自驱力强，Vibe Coding 爱好者，拥抱变化。
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">
            📍 上海
          </span>
          <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">
            📧 wwjobs@163.com
          </span>
          <span className="px-4 py-2 rounded-full bg-surface text-sm text-secondary">
            🔗 github.com/ww028
          </span>
        </div>
      </section>

      {/* 专业技能 */}
      <section className="animate-fade-in-up stagger-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
          专业技能
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="p-6 rounded-2xl bg-surface text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)]"
            >
              <div className="text-3xl font-bold tracking-tight text-accent mb-2">
                {skill.level}%
              </div>
              <div className="text-sm font-medium text-secondary">
                {skill.name}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
