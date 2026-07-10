import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h3>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-agent underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-muted-foreground last:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-1.5 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border px-3 py-1.5">{children}</td>,
  hr: () => <hr className="my-4 border-border" />,
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const isInline = !match;
    return (
      <CodeBlock
        code={String(children).replace(/\n$/, "")}
        language={match?.[1]}
        inline={isInline}
      />
    );
  },
  pre: ({ children }) => <>{children}</>,
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="text-[15px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
