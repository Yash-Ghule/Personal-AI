"use client"

import { cn } from "@/lib/utils"
import { User, Bot } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MessageProps {
  message: {
    id: string
    content: string
    role: "user" | "assistant" | "system"
  }
}

export default function MessageComponent({ message }: MessageProps) {
  const isLoading = message.content === "Loading..."

  return (
    <div className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] rounded-lg p-4",
          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <ReactMarkdown
                className="prose dark:prose-invert max-w-none"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")

                    if (inline) {
                      return (
                        <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-sm font-mono" {...props}>
                          {children}
                        </code>
                      )
                    }

                    return !inline && match ? (
                      <div className="relative my-4 rounded-md overflow-hidden">
                        <div className="bg-gray-800 text-gray-200 text-xs py-1 px-4 font-mono">{match[1]}</div>
                        <SyntaxHighlighter
                          language={match[1]}
                          style={vscDarkPlus}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: "0 0 0.375rem 0.375rem",
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className={cn(
                          "block bg-gray-200 dark:bg-gray-800 p-3 rounded-md text-sm font-mono whitespace-pre-wrap",
                          className,
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-6 mb-2">{children}</ul>
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-6 mb-2">{children}</ol>
                  },
                  li({ children }) {
                    return <li className="mb-1">{children}</li>
                  },
                  h1({ children }) {
                    return <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>
                  },
                  h2({ children }) {
                    return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
                  },
                  h3({ children }) {
                    return <h3 className="text-md font-bold mb-2 mt-3">{children}</h3>
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
