import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { createMemo, Show } from "solid-js"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { usePlatform } from "@/context/platform"
import { useSettings } from "@/context/settings"
import { useTerminal } from "@/context/terminal"
import { focusTerminalById } from "@/pages/session/helpers"
import { useSessionLayout } from "@/pages/session/session-layout"
import { StatusPopover } from "../status-popover"

export function SessionViewToolbar() {
  const layout = useLayout()
  const command = useCommand()
  const platform = usePlatform()
  const language = useLanguage()
  const settings = useSettings()
  const terminal = useTerminal()
  const { view } = useSessionLayout()

  const isDesktopBeta = platform.platform === "desktop" && import.meta.env.VITE_OPENCODE_CHANNEL === "beta"
  const tree = createMemo(() => !isDesktopBeta || settings.general.showFileTree())
  const term = createMemo(() => !isDesktopBeta || settings.general.showTerminal())
  const status = createMemo(() => !isDesktopBeta || settings.general.showStatus())

  const toggleTerminal = () => {
    const next = !view().terminal.opened()
    view().terminal.toggle()
    if (!next) return

    const id = terminal.active()
    if (!id) return
    focusTerminalById(id)
  }

  return (
    <div class="flex items-center gap-1 shrink-0" data-component="session-view-toolbar">
      <Show when={status()}>
        <Tooltip placement="bottom" value={language.t("status.popover.trigger")}>
          <StatusPopover />
        </Tooltip>
      </Show>
      <Show when={term()}>
        <TooltipKeybind title={language.t("command.terminal.toggle")} keybind={command.keybind("terminal.toggle")}>
          <Button
            variant="ghost"
            class="group/terminal-toggle w-8 h-6 p-0 box-border shrink-0 rounded-md"
            onClick={toggleTerminal}
            aria-label={language.t("command.terminal.toggle")}
            aria-expanded={view().terminal.opened()}
            aria-controls="terminal-panel"
          >
            <Icon size="small" name={view().terminal.opened() ? "terminal-active" : "terminal"} />
          </Button>
        </TooltipKeybind>
      </Show>
      <TooltipKeybind title={language.t("command.review.toggle")} keybind={command.keybind("review.toggle")}>
        <Button
          variant="ghost"
          class="group/review-toggle w-8 h-6 p-0 box-border shrink-0 rounded-md"
          onClick={() => view().reviewPanel.toggle()}
          aria-label={language.t("command.review.toggle")}
          aria-expanded={view().reviewPanel.opened()}
          aria-controls="review-panel"
        >
          <Icon size="small" name={view().reviewPanel.opened() ? "review-active" : "review"} />
        </Button>
      </TooltipKeybind>
      <Show when={tree()}>
        <TooltipKeybind title={language.t("command.fileTree.toggle")} keybind={command.keybind("fileTree.toggle")}>
          <Button
            variant="ghost"
            class="w-8 h-6 p-0 box-border shrink-0 rounded-md"
            onClick={() => layout.fileTree.toggle()}
            aria-label={language.t("command.fileTree.toggle")}
            aria-expanded={layout.fileTree.opened()}
            aria-controls="file-tree-panel"
          >
            <div class="relative flex items-center justify-center size-4">
              <Icon
                size="small"
                name={layout.fileTree.opened() ? "file-tree-active" : "file-tree"}
                classList={{
                  "text-icon-strong": layout.fileTree.opened(),
                  "text-icon-weak": !layout.fileTree.opened(),
                }}
              />
            </div>
          </Button>
        </TooltipKeybind>
      </Show>
    </div>
  )
}
