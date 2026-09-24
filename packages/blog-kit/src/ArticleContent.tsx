import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { remarkHeadingIds } from "./headings.js";

export interface ArticleContentProps {
  content: string;
  id?: string;
  className?: string;
}

/** No client directive or browser APIs: render Markdown in the host's server page. */
export function ArticleContent({ content, id, className = "" }: ArticleContentProps) {
  return (
    <div id={id} className={`blog-kit-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHeadingIds]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
