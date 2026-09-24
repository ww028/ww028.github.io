import type { Heading, Root, RootContent } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Node } from "unist";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

type MdastNode = Root | RootContent;

function isMdastRoot(node: Node): node is Root {
  return node.type === "root" && "children" in node && Array.isArray(node.children);
}

function visitHeadings(node: MdastNode, visitor: (heading: Heading) => void): void {
  if (node.type === "heading") visitor(node);
  if ("children" in node) {
    for (const child of node.children) visitHeadings(child as MdastNode, visitor);
  }
}

/** Preserve the existing simple-heading URLs; callers handle uniqueness per article. */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function assignHeadingIds(tree: Root): void {
  const used = new Set<string>();
  visitHeadings(tree, (node) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const base = generateHeadingId(toString(node));
    let id = base;
    let suffix = 1;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    node.data = {
      ...node.data,
      hProperties: { ...node.data?.hProperties, id },
    };
  });
}

/** Shared by the renderer and TOC: AST parsing skips fenced code and reads inline text. */
export function remarkHeadingIds() {
  return (tree: Root) => assignHeadingIds(tree);
}

export function extractHeadings(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  if (!isMdastRoot(tree)) throw new Error("Expected a Markdown root node");
  assignHeadingIds(tree);
  const headings: TocItem[] = [];
  visitHeadings(tree, (node) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const id = node.data?.hProperties?.id;
    if (typeof id !== "string") return;
    headings.push({ id, text: toString(node), level: node.depth });
  });
  return headings;
}
