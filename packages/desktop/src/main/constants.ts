import { app } from "electron"

type Channel = "dev" | "beta" | "prod" | "opencodex"
const raw = import.meta.env.OPENCODE_CHANNEL
export const CHANNEL: Channel =
  raw === "dev" || raw === "beta" || raw === "prod" || raw === "opencodex" ? raw : "dev"

export const SETTINGS_STORE = "opencode.settings"
export const DEFAULT_SERVER_URL_KEY = "defaultServerUrl"
export const WSL_ENABLED_KEY = "wslEnabled"
// Fork release uses the same app id as prod; disable official auto-update feed.
export const UPDATER_ENABLED = app.isPackaged && CHANNEL !== "dev" && CHANNEL !== "opencodex"
