import { $ } from "bun"
import { resolveChannel } from "./utils"

const arg = process.argv[2]
const resolved = arg === "dev" || arg === "beta" || arg === "prod" || arg === "opencodex" ? arg : resolveChannel()
const channel = resolved === "opencodex" ? "prod" : resolved

const src = `./icons/${channel}`
const dest = "resources/icons"

await $`rm -rf ${dest}`
await $`cp -R ${src} ${dest}`
console.log(`Copied ${channel} icons from ${src} to ${dest}`)
