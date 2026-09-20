/**
 * 清洗 Commit 文本并移除外层 Markdown 代码块标记
 */
export function cleanCommitMessage(rawMessage: string): string {
  if (!rawMessage) {
    return ""
  }

  let cleanedMessage = rawMessage.trim()
  cleanedMessage = cleanedMessage.replace(/^```[a-zA-Z0-9_-]*\r?\n?/, "")
  cleanedMessage = cleanedMessage.replace(/\r?\n?```$/, "")
  return cleanedMessage.trim()
}
