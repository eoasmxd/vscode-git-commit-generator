const esbuild = require("esbuild")

const isProduction = process.argv.includes("--production")
const isWatch = process.argv.includes("--watch")

/**
 * Report build lifecycle status to VS Code problem matcher.
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started")
    })
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`)
        if (location) {
          console.error(`    ${location.file}:${location.line}:${location.column}:`)
        }
      })
      console.log("[watch] watching for changes...")
    })
  },
}

const buildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: !isProduction,
  minify: isProduction,
  logLevel: "info",
  plugins: [esbuildProblemMatcherPlugin],
}

async function main() {
  if (isWatch) {
    const context = await esbuild.context(buildOptions)
    await context.watch()
  } else {
    await esbuild.build(buildOptions)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
