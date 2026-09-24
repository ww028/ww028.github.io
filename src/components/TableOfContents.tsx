import { extractHeadings } from "@ww028/blog-kit/headings";
import { TableOfContents as SharedTableOfContents } from "@ww028/blog-kit/toc";

export default function TableOfContents({ content }: { content: string }) {
  return (
    <SharedTableOfContents
      key={content}
      headings={extractHeadings(content)}
      contentId="article-content"
      className="hidden xl:block fixed top-32 right-[max(1rem,calc((100vw-64rem)/2-16rem))] w-56"
    />
  );
}
