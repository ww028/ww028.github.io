import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const viewsFile = path.join(process.cwd(), "content/views.json");
const articlesDir = path.join(process.cwd(), "content/articles");
const VALID_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function articleExists(slug: string): boolean {
  return fs.existsSync(path.join(articlesDir, `${slug}.md`));
}

// --- Rate Limiter with periodic cleanup ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;
const CLEANUP_INTERVAL = 5 * 60_000;

let lastCleanup = Date.now();

function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  cleanupRateLimitMap();
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --- File lock for concurrent write safety ---
let writeLock: Promise<void> = Promise.resolve();

function withWriteLock<T>(fn: () => T): Promise<T> {
  let release: () => void;
  const next = new Promise<void>((resolve) => { release = resolve; });
  const current = writeLock;
  writeLock = next;
  return current.then(() => {
    try {
      return fn();
    } finally {
      release!();
    }
  });
}

function getViews(): Record<string, number> {
  if (!fs.existsSync(viewsFile)) {
    return {};
  }
  const data = fs.readFileSync(viewsFile, "utf8");
  return JSON.parse(data);
}

function saveViews(views: Record<string, number>) {
  const tmpFile = viewsFile + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify(views, null, 2));
  fs.renameSync(tmpFile, viewsFile);
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const views = getViews();

  if (slug) {
    if (!VALID_SLUG_RE.test(slug)) {
      return NextResponse.json({ error: "invalid slug" }, { status: 400 });
    }
    return NextResponse.json({ views: views[slug] || 0 });
  }
  return NextResponse.json({ views });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let slug: string;
  try {
    const body = await request.json();
    slug = body.slug;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  if (!VALID_SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  if (!articleExists(slug)) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }

  const newCount = await withWriteLock(() => {
    const views = getViews();
    views[slug] = (views[slug] || 0) + 1;
    saveViews(views);
    return views[slug];
  });

  return NextResponse.json({ views: newCount });
}
