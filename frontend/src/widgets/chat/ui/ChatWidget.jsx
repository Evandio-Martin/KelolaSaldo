import { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  Bot,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useChatStore } from "@/entities/chat";
import { MessageBubble } from "@/features/chat";
import { Seo } from "@/shared/ui/Seo";

const MODELS = [
  { value: "openai/gpt-oss-120b:free", label: "GPT OSS 120B (Default)" },
  { value: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (Free)" },
  { value: "deepseek/deepseek-r1:free", label: "DeepSeek R1 (Free)" },
  { value: "deepseek/deepseek-chat-v3-0324:free", label: "DeepSeek V3 (Free)" },
  {
    value: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B (Free)",
  },
  { value: "qwen/qwen3-14b:free", label: "Qwen3 14B (Free)" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Paid)" },
];

export const ChatWidget = () => {
  const {
    messages,
    isStreaming,
    error,
    selectedModel,
    sendMessage,
    clearChat,
    setModel,
  } = useChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isStreaming) return;
    setInput("");
    textareaRef.current?.focus();
    await sendMessage(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const lastIndex = messages.length - 1;

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
      <Seo
        title="AI Chat"
        description="Chat with AI models powered by OpenRouter. Choose from multiple free and paid models."
        canonical="/chat"
        noIndex
      />
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Bot size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm leading-tight font-bold">AI Chat</h1>
            <p className="text-xs text-neutral-500">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setModel(e.target.value)}
            disabled={isStreaming}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            onClick={clearChat}
            disabled={isStreaming || messages.length === 0}
            title="Clear conversation"
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 px-5 py-5 dark:bg-neutral-900">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30">
              <MessageSquare size={32} className="text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                Start a conversation
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Select a model above and send a message
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLastAssistant={
                  msg.role === "assistant" && index === lastIndex
                }
                isStreaming={isStreaming}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex shrink-0 items-center gap-2 border-t border-red-200 bg-red-50 px-5 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-3.5 dark:border-neutral-700 dark:bg-neutral-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={isStreaming}
            className="max-h-36 min-h-[42px] flex-1 resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700 dark:placeholder-neutral-500 dark:disabled:bg-neutral-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-400 dark:disabled:bg-neutral-600"
          >
            {isStreaming ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </form>
        <p className="mt-1.5 text-xs text-neutral-400">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
};
