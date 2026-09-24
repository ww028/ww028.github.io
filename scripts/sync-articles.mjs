#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const ARTICLE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const ALLOWED_TARGETS = new Set(["blog", "personal"]);
const MANIFEST_RELATIVE_PATH = path.join("content", ".article-sync-manifest.json");

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function visit(node, visitor) {
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, visitor);
  }
}

function validateFrontmatter(fileName, data) {
  for (const key of ["title", "summary"]) {
    if (typeof data[key] !== "string" || data[key].trim() === "") {
      throw new Error(`${fileName}: frontmatter.${key} 必须是非空字符串`);
    }
  }
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`${fileName}: frontmatter.date 必须是 YYYY-MM-DD`);
  }
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`${fileName}: frontmatter.tags 必须是字符串数组`);
  }
  if (!Array.isArray(data.publishTo) || data.publishTo.length === 0) {
    throw new Error(`${fileName}: frontmatter.publishTo 必须显式声明发布范围`);
  }
  for (const target of data.publishTo) {
    if (!ALLOWED_TARGETS.has(target)) throw new Error(`${fileName}: 未知发布目标 ${target}`);
  }
  if (!data.publishTo.includes("blog")) {
    throw new Error(`${fileName}: 博客仓库中的文章必须包含 blog 发布目标`);
  }
}

function extractManagedAssets(markdown, fileName) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const assets = new Set();
  visit(tree, (node) => {
    if (node.type !== "image" || typeof node.url !== "string") return;
    let resource = node.url.split(/[?#]/, 1)[0];
    if (!resource.startsWith("/article-assets/") && !resource.startsWith("article-assets/")) return;
    resource = resource.replace(/^\//, "");
    let decoded;
    try {
      decoded = decodeURIComponent(resource);
    } catch {
      throw new Error(`${fileName}: 图片路径不是合法 URI：${node.url}`);
    }
    const normalized = path.posix.normalize(decoded);
    if (!normalized.startsWith("article-assets/") || normalized.includes("..")) {
      throw new Error(`${fileName}: 图片路径越界：${node.url}`);
    }
    assets.add(normalized);
  });
  return [...assets].sort();
}

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, MANIFEST_RELATIVE_PATH);
  if (!fs.existsSync(manifestPath)) return { schemaVersion: 1, articles: [], assets: [] };
  const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.articles) || !Array.isArray(parsed.assets)) {
    throw new Error(`同步清单格式无效：${manifestPath}`);
  }
  return parsed;
}

function buildPlan(sourceRoot, targetRoot) {
  const sourceArticles = path.join(sourceRoot, "content", "articles");
  const oldManifest = readManifest(targetRoot);
  const oldManaged = new Map([
    ...oldManifest.articles.map((item) => [item.path, item.sha256]),
    ...oldManifest.assets.map((item) => [item.path, item.sha256]),
  ]);
  const records = [];
  const assetPaths = new Set();

  for (const fileName of listFiles(sourceArticles)) {
    if (!fileName.endsWith(".md")) continue;
    if (!ARTICLE_RE.test(fileName)) throw new Error(`文章文件名不符合 slug 规则：${fileName}`);
    const sourcePath = path.join(sourceArticles, fileName);
    const body = fs.readFileSync(sourcePath);
    const parsed = matter(body.toString("utf8"));
    validateFrontmatter(fileName, parsed.data);
    if (!parsed.data.publishTo.includes("personal")) continue;
    const relativePath = path.posix.join("content/shared/articles", fileName);
    records.push({ type: "article", path: relativePath, sourcePath, body, sha256: sha256(body) });
    for (const asset of extractManagedAssets(parsed.content, fileName)) assetPaths.add(asset);
  }

  for (const relativeAsset of [...assetPaths].sort()) {
    const sourcePath = path.join(sourceRoot, "public", relativeAsset);
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw new Error(`文章引用的共享资源不存在：public/${relativeAsset}`);
    }
    const body = fs.readFileSync(sourcePath);
    records.push({ type: "asset", path: path.posix.join("public", relativeAsset), sourcePath, body, sha256: sha256(body) });
  }

  const conflicts = [];
  const writes = [];
  const adopted = [];
  for (const record of records) {
    const destination = path.join(targetRoot, record.path);
    if (!fs.existsSync(destination)) {
      writes.push(record.path);
      continue;
    }
    const destinationHash = sha256(fs.readFileSync(destination));
    if (oldManaged.has(record.path)) {
      const previousHash = oldManaged.get(record.path);
      if (destinationHash === record.sha256) continue;
      if (destinationHash === previousHash) {
        writes.push(record.path);
      } else {
        conflicts.push(record.path);
      }
    } else if (destinationHash === record.sha256) {
      adopted.push(record.path);
    } else {
      conflicts.push(record.path);
    }
  }

  const nextPaths = new Set(records.map((record) => record.path));
  const deletes = [...oldManaged.keys()].filter((managedPath) => !nextPaths.has(managedPath)).sort();
  if (conflicts.length) {
    throw new Error(`发现未受清单管理的同名文件，拒绝覆盖：\n- ${conflicts.join("\n- ")}`);
  }

  const articleRecords = records.filter((record) => record.type === "article");
  const assetRecords = records.filter((record) => record.type === "asset");
  const contentVersion = sha256(Buffer.from(records.map((record) => `${record.path}:${record.sha256}`).join("\n")));
  const manifest = {
    schemaVersion: 1,
    source: "ww028.github.io",
    contentVersion,
    articles: articleRecords.map(({ path: recordPath, sha256: hash }) => ({ path: recordPath, sha256: hash })),
    assets: assetRecords.map(({ path: recordPath, sha256: hash }) => ({ path: recordPath, sha256: hash })),
  };
  return { records, manifest, writes: writes.sort(), deletes, adopted: adopted.sort() };
}

function safeManagedPath(targetRoot, relativePath) {
  const resolvedRoot = fs.realpathSync(targetRoot);
  const resolved = path.resolve(targetRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`同步路径越界：${relativePath}`);
  }
  return resolved;
}

export function syncArticles({ sourceRoot, targetRoot, write = false }) {
  const source = fs.realpathSync(sourceRoot);
  const target = fs.realpathSync(targetRoot);
  const plan = buildPlan(source, target);
  if (!write) return { mode: "check", ...plan };

  const stage = fs.mkdtempSync(path.join(os.tmpdir(), "ww028-article-sync-"));
  try {
    for (const record of plan.records) {
      const staged = path.join(stage, record.path);
      fs.mkdirSync(path.dirname(staged), { recursive: true });
      fs.writeFileSync(staged, record.body);
    }
    for (const record of plan.records) {
      const destination = safeManagedPath(target, record.path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(stage, record.path), destination);
    }
    for (const relativePath of plan.deletes) {
      const destination = safeManagedPath(target, relativePath);
      if (fs.existsSync(destination)) fs.rmSync(destination);
    }
    const manifestPath = safeManagedPath(target, MANIFEST_RELATIVE_PATH);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(plan.manifest, null, 2)}\n`);
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }
  return { mode: "write", ...plan };
}

function parseArgs(argv) {
  const args = { sourceRoot: process.cwd(), targetRoot: "", write: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--source") args.sourceRoot = argv[++index] ?? "";
    else if (value === "--target") args.targetRoot = argv[++index] ?? "";
    else if (value === "--write") args.write = true;
    else if (value === "--check") args.write = false;
    else throw new Error(`未知参数：${value}`);
  }
  if (!args.sourceRoot || !args.targetRoot) throw new Error("必须提供 --target；--source 默认为当前目录");
  return args;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = syncArticles(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({
      mode: result.mode,
      contentVersion: result.manifest.contentVersion,
      articles: result.manifest.articles.length,
      assets: result.manifest.assets.length,
      writes: result.writes,
      deletes: result.deletes,
      adopted: result.adopted,
    }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
