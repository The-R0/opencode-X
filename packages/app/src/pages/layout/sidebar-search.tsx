import { Button } from "@opencode-ai/ui/button"
import { Keybind } from "@opencode-ai/ui/keybind"
import { getFilename } from "@opencode-ai/core/util/path"
import { createMemo, Show, type JSX } from "solid-js"
import { useParams } from "@solidjs/router"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { usePlatform } from "@/context/platform"
import { useSettings } from "@/context/settings"
import { decode64 } from "@/utils/base64"

export const SidebarSearch = (): JSX.Element => {
  const command = useCommand()
  const language = useLanguage()
  const layout = useLayout()
  const params = useParams()
  const platform = usePlatform()
  const settings = useSettings()

  const isDesktopBeta = platform.platform === "desktop" && import.meta.env.VITE_OPENCODE_CHANNEL === "beta"
  const visible = createMemo(() => !isDesktopBeta || settings.general.showSearch())

  const projectDirectory = createMemo(() => decode64(params.dir) ?? "")
  const name = createMemo(() => {
    const directory = projectDirectory()
    if (!directory) return language.t("palette.search.placeholder")
    const current = layout.projects.list().find((p) => p.worktree === directory || p.sandboxes?.includes(directory))
    if (current) return current.name || getFilename(current.worktree)
    return getFilename(directory)
  })
  const hotkey = createMemo(() => command.keybind("file.open"))

  return (
    <Show when={visible()}>
      <div data-component="sidebar-search" class="shrink-0 border-b border-border-weaker-base px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="small"
          class="flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border-weak-base bg-surface-panel shadow-none cursor-default"
          onClick={() => command.trigger("file.open")}
          aria-label={language.t("session.header.searchFiles")}
        >
          <span class="min-w-0 flex-1 truncate text-left text-12-regular text-text-weak">
            {language.t("session.header.search.placeholder", { project: name() })}
          </span>
          <Show when={hotkey()}>
            {(keybind) => (
              <Keybind class="shrink-0 !border-0 !bg-transparent !shadow-none px-0 text-text-weaker">{keybind()}</Keybind>
            )}
          </Show>
        </Button>
      </div>
    </Show>
  )
}
