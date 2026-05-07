import { axiosInstance } from "@/shared/api/axiosInstance";

/**
 * Stream chat completion from backend POST /ai/chat
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} model - Model ID (optional, backend has default)
 * @param {function} onToken - Called with each text token
 * @param {function} onDone - Called when stream finishes
 * @param {function} onError - Called with Error on failure
 */
export const streamChatCompletion = async (
  messages,
  model,
  onToken,
  onDone,
  onError,
) => {
  try {
    const response = await axiosInstance.post(
      "/ai/chat",
      { messages, model },
      { responseType: "stream", adapter: "fetch" },
    );

    const reader = response.data.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.content;
          if (content) onToken(content);
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
