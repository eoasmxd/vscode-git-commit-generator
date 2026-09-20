import * as vscode from "vscode"
import type { GitApi, GitExtensionExports, GitRepository } from "../types"

/**
 * Git 扩展与仓库管理器
 */
export class GitManager {
  private static gitApi: GitApi | undefined

  private static async getGitApi(): Promise<GitApi> {
    if (this.gitApi) {
      return this.gitApi
    }

    const gitExtension = vscode.extensions.getExtension<GitExtensionExports>("vscode.git")
    if (!gitExtension) {
      throw new Error(vscode.l10n.t("VS Code built-in Git extension not found. Please ensure Git is enabled."))
    }

    if (!gitExtension.isActive) {
      await gitExtension.activate()
    }

    const gitExports = gitExtension.exports
    if (!gitExports || typeof gitExports.getAPI !== "function") {
      throw new Error(vscode.l10n.t("Unable to get VS Code Git extension API."))
    }

    this.gitApi = gitExports.getAPI(1)
    return this.gitApi
  }

  /**
   * 解析当前生效的 Git 仓库
   */
  public static async resolveRepository(sourceControl?: vscode.SourceControl): Promise<GitRepository> {
    const gitApi = await this.getGitApi()

    if (sourceControl?.rootUri) {
      const repo = gitApi.getRepository(sourceControl.rootUri)
      if (repo) {
        return repo
      }
    }

    if (gitApi.repositories.length > 0) {
      return gitApi.repositories[0]
    }

    throw new Error(vscode.l10n.t("No open Git repository detected in the current workspace."))
  }
}
