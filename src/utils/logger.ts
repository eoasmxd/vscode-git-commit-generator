import * as vscode from "vscode"

const CHANNEL_NAME = "Git Commit Generator"

/**
 * 插件统一日志输出器
 */
export class Logger {
  private static outputChannel: vscode.OutputChannel | undefined

  public static initialize(): void {
    this.getChannel()
  }

  public static info(message: string): void {
    this.log(`[INFO] ${message}`)
  }

  public static error(message: string, error?: unknown): void {
    const errorDetail = error instanceof Error ? `\n${error.stack || error.message}` : error ? `\n${String(error)}` : ""
    this.log(`[ERROR] ${message}${errorDetail}`)
  }

  public static show(): void {
    this.getChannel().show()
  }

  public static dispose(): void {
    this.outputChannel?.dispose()
    this.outputChannel = undefined
  }

  private static getChannel(): vscode.OutputChannel {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel(CHANNEL_NAME)
    }
    return this.outputChannel
  }

  private static log(formattedMessage: string): void {
    const timestamp = new Date().toLocaleTimeString()
    this.getChannel().appendLine(`[${timestamp}] ${formattedMessage}`)
  }
}
