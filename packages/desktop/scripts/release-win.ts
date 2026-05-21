import { $ } from "bun"
import { join } from "node:path"

const desktopRoot = join(import.meta.dir, "..")

process.env.OPENCODE_CHANNEL = "opencodex"
// Local Windows builds: skip Authenticode signing (no cert). Icon embedding still runs via rcedit.
process.env.CSC_IDENTITY_AUTO_DISCOVERY = "false"

await $`bun ./scripts/copy-icons.ts prod`.cwd(desktopRoot)
await $`bun ./scripts/prebuild.ts`.cwd(desktopRoot)
await $`bun run build`.cwd(desktopRoot)
// Fresh output dir avoids failures when dist/ is locked by a running OpenCode instance.
if (!process.env.DESKTOP_BUILD_OUTPUT) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)
  process.env.DESKTOP_BUILD_OUTPUT = `dist-build-${stamp}`
}
await $`bun run package:win`.cwd(desktopRoot)

const out = process.env.DESKTOP_BUILD_OUTPUT
console.log(`OpenCode Windows installer: packages/desktop/${out}/opencodex-desktop-win-x64.exe`)
