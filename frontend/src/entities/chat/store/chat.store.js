import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { streamChatCompletion } from "@/entities/chat/api/chat.api";

export const DEFAULT_MODEL = "openai/gpt-oss-120b:free";

export const useChatStore = create((set, get) => ({
  messages: [],
  isStreaming: false,
  selectedModel: DEFAULT_MODEL,
  error: null,

  setModel: (model) => set({ selectedModel: model }),

  clearChat: () => set({ messages: [], error: null }),

  sendMessage: async (content) => {
    const { messages, selectedModel } = get();

    const userMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const assistantId = uuidv4();
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMessage, assistantMessage],
      isStreaming: true,
      error: null,
    });

    const apiMessages = [...messages, userMessage].map(({ role, content }) => ({
      role,
      content,
    }));

    await streamChatCompletion(
      apiMessages,
      selectedModel,
      (token) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + token }
              : msg,
          ),
        }));
      },
      () => {
        set({ isStreaming: false });
      },
      (error) => {
        set((state) => ({
          isStreaming: false,
          error: error.message,
          messages: state.messages.filter((msg) => msg.id !== assistantId),
        }));
      },
    );
  },
}));
