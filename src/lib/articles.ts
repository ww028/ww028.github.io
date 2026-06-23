import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  date: string;
  content: string;
  pinned: boolean;
  tags: string[];
}

const articlesDirectory = path.join(process.cwd(), "content/articles");

export function getAllArticles(): Article[] {
  const files = fs.readdirSync(articlesDirectory);

  const articles = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(articlesDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        summary: data.summary,
        date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date,
        content,
        pinned: data.pinned === true,
        tags: Array.isArray(data.tags) ? data.tags : [],
      };
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.date > b.date ? -1 : 1;
    });

  return articles;
}

const VALID_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getArticleBySlug(slug: string): Article | undefined {
  if (!VALID_SLUG_RE.test(slug)) {
    return undefined;
  }

  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(articlesDirectory)) {
    return undefined;
  }

  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title,
    summary: data.summary,
    date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date,
    content,
    pinned: data.pinned === true,
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

export function getAllTags(): { name: string; count: number }[] {
  const articles = getAllArticles();
  const tagMap = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
