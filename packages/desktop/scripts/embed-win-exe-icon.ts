import { rcedit } from "rcedit"
import path from "node:path"

export async function embedWinExeIcon(appOutDir: string, productFilename: string, projectDir: string) {
  const exe = path.join(appOutDir, `${productFilename}.exe`)
  const icon = path.join(projectDir, "resources/icons/icon.ico")
  await rcedit(exe, { icon })
}
