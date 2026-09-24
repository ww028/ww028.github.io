import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { syncArticles } from "../scripts/sync-articles.mjs";

function article(title, publishTo = "[blog, personal]", body = "正文") {
  return `---\ntitle: ${title}\nsummary: 摘要\ndate: 2026-09-24\ntags: [测试]\npublishTo: ${publishTo}\n---\n\n${body}\n`;
}

function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ww028-sync-test-"));
  const source = path.join(root, "source");
  const target = path.join(root, "target");
  fs.mkdirSync(path.join(source, "content/articles"), { recursive: true });
  fs.mkdirSync(path.join(source, "public/article-assets"), { recursive: true });
  fs.mkdirSync(path.join(target, "content/articles"), { recursive: true });
  fs.mkdirSync(path.join(target, "content/shared/articles"), { recursive: true });
  fs.mkdirSync(path.join(target, "public/article-assets"), { recursive: true });
  return { root, source, target };
}

test("adopts identical files, copies shared files and preserves personal-only content", () => {
  const { source, target } = setup();
  const shared = article("共享文章", "[blog, personal]", "![图](/article-assets/chart.svg)");
  fs.writeFileSync(path.join(source, "content/articles/shared.md"), shared);
  fs.writeFileSync(path.join(source, "public/article-assets/chart.svg"), "<svg/>");
  fs.writeFileSync(path.join(source, "content/articles/blog-only.md"), article("博客专属", "[blog]"));
  fs.writeFileSync(path.join(target, "content/shared/articles/shared.md"), shared);
  fs.writeFileSync(path.join(target, "content/articles/personal-only.md"), article("个人站专属", "[blog]"));

  const preview = syncArticles({ sourceRoot: source, targetRoot: target });
  assert.deepEqual(preview.adopted, ["content/shared/articles/shared.md"]);
  syncArticles({ sourceRoot: source, targetRoot: target, write: true });

  assert.equal(fs.readFileSync(path.join(target, "content/shared/articles/shared.md"), "utf8"), shared);
  assert.equal(fs.readFileSync(path.join(target, "public/article-assets/chart.svg"), "utf8"), "<svg/>");
  assert.ok(fs.existsSync(path.join(target, "content/articles/personal-only.md")));
  assert.ok(!fs.existsSync(path.join(target, "content/articles/blog-only.md")));
});

test("refuses to overwrite an unmanaged conflicting slug", () => {
  const { source, target } = setup();
  fs.writeFileSync(path.join(source, "content/articles/conflict.md"), article("源文章"));
  fs.writeFileSync(path.join(target, "content/shared/articles/conflict.md"), article("个人站文章"));
  assert.throws(() => syncArticles({ sourceRoot: source, targetRoot: target, write: true }), /拒绝覆盖/);
});

test("refuses to overwrite a manually edited managed file", () => {
  const { source, target } = setup();
  fs.writeFileSync(path.join(source, "content/articles/shared.md"), article("第一版"));
  syncArticles({ sourceRoot: source, targetRoot: target, write: true });
  fs.writeFileSync(path.join(target, "content/shared/articles/shared.md"), article("个人手改"));
  fs.writeFileSync(path.join(source, "content/articles/shared.md"), article("第二版"));
  assert.throws(() => syncArticles({ sourceRoot: source, targetRoot: target, write: true }), /拒绝覆盖/);
});

test("removes only stale files listed in the previous manifest", () => {
  const { source, target } = setup();
  const first = article("共享文章");
  fs.writeFileSync(path.join(source, "content/articles/shared.md"), first);
  syncArticles({ sourceRoot: source, targetRoot: target, write: true });
  fs.writeFileSync(path.join(target, "content/articles/personal-only.md"), article("个人站专属", "[blog]"));
  fs.unlinkSync(path.join(source, "content/articles/shared.md"));
  syncArticles({ sourceRoot: source, targetRoot: target, write: true });
  assert.ok(!fs.existsSync(path.join(target, "content/shared/articles/shared.md")));
  assert.ok(fs.existsSync(path.join(target, "content/articles/personal-only.md")));
});

test("validates explicit publishing metadata and referenced assets", () => {
  const { source, target } = setup();
  fs.writeFileSync(path.join(source, "content/articles/missing-scope.md"), article("无范围").replace("publishTo: [blog, personal]\n", ""));
  assert.throws(() => syncArticles({ sourceRoot: source, targetRoot: target }), /publishTo/);
  fs.writeFileSync(path.join(source, "content/articles/missing-scope.md"), article("资源缺失", "[blog, personal]", "![图](/article-assets/missing.svg)"));
  assert.throws(() => syncArticles({ sourceRoot: source, targetRoot: target }), /资源不存在/);
});
