import { exec } from "child_process"
import { promisify } from "util"
import { DEFAULT_CONFIG } from "../constants"

const execAsync = promisify(exec)
const MAX_UNTRACKED_FILES = 10

/**
 * 提取 Git 变更差异（优先暂存区，无暂存时汇总工作区与未跟踪文件）
 */
export async function getGitDiff(cwd: string): Promise<string> {
  const stagedDiff = await getStagedDiff(cwd)
  if (stagedDiff.trim()) {
    return truncateDiff(stagedDiff.trim())
  }

  const workingTreeDiff = await getWorkingTreeDiff(cwd)
  const untrackedDiff = await getUntrackedFilesDiff(cwd)

  const combinedDiff = [workingTreeDiff.trim(), untrackedDiff.trim()].filter(Boolean).join("\n\n")
  return truncateDiff(combinedDiff)
}

async function getStagedDiff(cwd: string): Promise<string> {
  try {
    const { stdout: nonDeleted } = await execAsync("git --no-pager diff --staged --diff-filter=d", { cwd })
    const { stdout: deletedStat } = await execAsync("git --no-pager diff --staged --diff-filter=D --stat", { cwd })
    return [nonDeleted.trim(), deletedStat.trim()].filter(Boolean).join("\n\n")
  } catch {
    return ""
  }
}

async function getWorkingTreeDiff(cwd: string): Promise<string> {
  try {
    const { stdout: nonDeleted } = await execAsync("git --no-pager diff HEAD --diff-filter=d", { cwd })
    const { stdout: deletedStat } = await execAsync("git --no-pager diff HEAD --diff-filter=D --stat", { cwd })
    return [nonDeleted.trim(), deletedStat.trim()].filter(Boolean).join("\n\n")
  } catch {
    try {
      const { stdout: nonDeleted } = await execAsync("git --no-pager diff --diff-filter=d", { cwd })
      const { stdout: deletedStat } = await execAsync("git --no-pager diff --diff-filter=D --stat", { cwd })
      return [nonDeleted.trim(), deletedStat.trim()].filter(Boolean).join("\n\n")
    } catch {
      return ""
    }
  }
}

async function getUntrackedFilesDiff(cwd: string): Promise<string> {
  try {
    const { stdout } = await execAsync("git ls-files --others --exclude-standard", { cwd })
    const files = stdout.split("\n").map((f) => f.trim()).filter(Boolean)
    if (files.length === 0) {
      return ""
    }

    const diffParts: string[] = []
    for (const file of files.slice(0, MAX_UNTRACKED_FILES)) {
      try {
        const { stdout: diffOutput } = await execAsync(`git --no-pager diff --no-index -- /dev/null "${file}"`, { cwd })
        if (diffOutput) {
          diffParts.push(diffOutput)
        }
      } catch (error: any) {
        if (error?.stdout) {
          diffParts.push(error.stdout)
        }
      }
    }

    if (files.length > MAX_UNTRACKED_FILES) {
      diffParts.push(`\n...and ${files.length - MAX_UNTRACKED_FILES} more untracked files.`)
    }

    return diffParts.join("\n")
  } catch {
    return ""
  }
}

function truncateDiff(diff: string): string {
  if (diff.length <= DEFAULT_CONFIG.DIFF_MAX_LENGTH) {
    return diff
  }

  return `${diff.substring(0, DEFAULT_CONFIG.DIFF_MAX_LENGTH)}\n\n[Note: Diff content is too large. Parts exceeding ${DEFAULT_CONFIG.DIFF_MAX_LENGTH} characters have been truncated.]`
}
