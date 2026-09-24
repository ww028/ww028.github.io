import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { ArticleContent } from '../dist/ArticleContent.js';
import { extractHeadings, generateHeadingId } from '../dist/headings.js';
import { TableOfContents } from '../dist/TableOfContents.js';

const render = (content) => renderToStaticMarkup(createElement(ArticleContent, { content }));
const fixture = [
  '# Not in TOC',
  '## **中文** 与 `code` [链接](https://example.com)',
  '### Child',
  '```md',
  '## Code sample, not a heading',
  '```',
  '## Repeat', '## Repeat', '## Repeat-1',
  'Setext heading\n--------------',
  '## !!!', '## ???',
].join('\n\n');

test('simple heading URLs remain compatible', () => {
  assert.equal(generateHeadingId('文章目录（TOC）'), '文章目录-toc');
  assert.equal(generateHeadingId('代码块语法高亮'), '代码块语法高亮');
});

test('renderer and TOC produce the same unique IDs from one AST rule', () => {
  const headings = extractHeadings(fixture);
  const renderedIds = [...render(fixture).matchAll(/<h[23] id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(renderedIds, headings.map(h => h.id));
  assert.equal(new Set(renderedIds).size, renderedIds.length);
  assert.equal(headings[0].text, '中文 与 code 链接');
  assert.ok(!headings.some(h => h.text.includes('Code sample')));
  assert.ok(headings.some(h => h.text === 'Setext heading'));
  assert.deepEqual(headings.filter(h => h.text.startsWith('Repeat')).map(h => h.id), ['repeat', 'repeat-1', 'repeat-1-1']);
});

test('GFM, images and code highlighting render on the server', () => {
  const html = render('| A | B |\n|---|---|\n| C | D |\n\n> Quote\n\n![Diagram](/article-assets/example.svg)\n\n```js\nconst value = 1;\n```');
  for (const fragment of ['<table>', '<blockquote>', 'src="/article-assets/example.svg"', 'hljs-keyword']) assert.ok(html.includes(fragment), fragment);
});

test('raw HTML and javascript URLs remain inert', () => {
  const html = render('<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
});

test('empty input renders no TOC and no headings', () => {
  assert.deepEqual(extractHeadings(''), []);
  assert.equal(renderToStaticMarkup(createElement(TableOfContents, { headings: [], contentId: 'article' })), '');
});

test('TOC links match targets and remain readable without JavaScript', () => {
  const headings = extractHeadings('## First\n\n### Second');
  const html = renderToStaticMarkup(createElement(TableOfContents, { headings, contentId: 'article' }));
  assert.ok(html.includes('aria-label="目录"'));
  for (const h of headings) assert.ok(html.includes(`href="#${h.id}"`));
});

test('packaged entry points preserve server/client separation', () => {
  const body = readFileSync(new URL('../dist/ArticleContent.js', import.meta.url), 'utf8');
  const toc = readFileSync(new URL('../dist/TableOfContents.js', import.meta.url), 'utf8');
  assert.ok(!body.includes('use client'));
  assert.ok(toc.startsWith('"use client";'));
  assert.ok(!toc.includes('from "./headings.js"'), 'TOC does not ship the Markdown parser');
});
