import PropTypes from "prop-types";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MessageBubble = ({ message, isLastAssistant, isStreaming }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div
        className={`max-w-[74%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-none bg-blue-600 text-white"
            : "rounded-tl-none bg-white text-neutral-900 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-2 mt-3 text-base font-bold">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-3 text-sm font-bold">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-1 mt-2 text-sm font-semibold">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ml-4 list-disc space-y-0.5">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ml-4 list-decimal space-y-0.5">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs text-rose-600 dark:bg-neutral-700 dark:text-rose-400">
                      {children}
                    </code>
                  ) : (
                    <code>{children}</code>
                  ),
                pre: ({ children }) => (
                  <pre className="mb-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100 dark:bg-neutral-950">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="mb-2 border-l-2 border-neutral-300 pl-3 text-neutral-500 dark:border-neutral-600">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-600"
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="mb-2 overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-neutral-100 dark:bg-neutral-700">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="border border-neutral-200 px-3 py-1.5 text-left font-semibold dark:border-neutral-600">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-neutral-200 px-3 py-1.5 dark:border-neutral-600">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {isLastAssistant && isStreaming && !message.content && (
              <span className="inline-flex items-center gap-1 py-0.5">
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
              </span>
            )}

            {isLastAssistant && isStreaming && message.content && (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse rounded-full bg-current" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.oneOf(["user", "assistant"]).isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  isLastAssistant: PropTypes.bool,
  isStreaming: PropTypes.bool,
};
