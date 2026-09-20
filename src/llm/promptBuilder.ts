import type { ChatMessage, PluginConfig } from "../types"

const DEFAULT_USER_NOTE =
  "(No extra notes provided. Please generate a concise and conventional commit message directly based on the code diff.)"

/**
 * 构造大模型对话消息
 */
export function buildChatMessages(config: PluginConfig, gitDiff: string, userInput: string): ChatMessage[] {
  const userInstruction = userInput.trim() || DEFAULT_USER_NOTE
  const renderedPrompt = config.promptTemplate
    .replaceAll("{diff}", gitDiff)
    .replaceAll("{user_input}", userInstruction)

  return [
    {
      role: "system",
      content: config.systemPrompt,
    },
    {
      role: "user",
      content: renderedPrompt,
    },
  ]
}
