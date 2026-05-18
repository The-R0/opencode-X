import { createEffect, createMemo, For, Show, type Accessor, type JSX } from "solid-js"
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  closestCenter,
  type DragEvent,
} from "@thisbeyond/solid-dnd"
import { ConstrainDragXAxis } from "@/utils/solid-dnd"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Button } from "@opencode-ai/ui/button"
import { Tooltip, TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { type LocalProject } from "@/context/layout"
import { SidebarHierarchy, type SidebarHierarchyContext } from "./sidebar-hierarchy"
import { SidebarSearch } from "./sidebar-search"

export const SidebarContent = (props: {
  mobile?: boolean
  opened: Accessor<boolean>
  hierarchy?: SidebarHierarchyContext
  aimMove: (event: MouseEvent) => void
  projects: Accessor<LocalProject[]>
  renderProject: (project: LocalProject) => JSX.Element
  handleDragStart: (event: unknown) => void
  handleDragEnd: () => void
  handleDragOver: (event: DragEvent) => void
  openProjectLabel: JSX.Element
  openProjectKeybind: Accessor<string | undefined>
  onOpenProject: () => void
  renderProjectOverlay: () => JSX.Element
  settingsLabel: Accessor<string>
  settingsKeybind: Accessor<string | undefined>
  onOpenSettings: () => void
  helpLabel: Accessor<string>
  onOpenHelp: () => void
  renderPanel: () => JSX.Element
}): JSX.Element => {
  const expanded = createMemo(() => !!props.mobile || props.opened())
  const hierarchyMode = createMemo(() => !!props.hierarchy && (props.mobile || props.opened()))
  const placement = () => (props.mobile ? "bottom" : "right")
  let panel: HTMLDivElement | undefined

  createEffect(() => {
    const el = panel
    if (!el) return
    if (hierarchyMode() || expanded()) {
      el.removeAttribute("inert")
      return
    }
    el.setAttribute("inert", "")
  })

  return (
    <div
      data-component="sidebar-panel"
      class="flex h-full w-full min-w-0 flex-col overflow-hidden border-r border-border-weaker-base bg-background-base"
    >
      <Show when={expanded()}>
        <SidebarSearch />
      </Show>
      <Show when={hierarchyMode()}>
        <SidebarHierarchy hierarchy={props.hierarchy!} mobile={props.mobile} />
      </Show>

      <Show when={!hierarchyMode()}>
        <div
          data-component="sidebar-rail"
          class="shrink-0 border-b border-border-weaker-base bg-background-stronger"
          onMouseMove={props.aimMove}
        >
          <div class="w-full">
            <DragDropProvider
              onDragStart={props.handleDragStart}
              onDragEnd={props.handleDragEnd}
              onDragOver={props.handleDragOver}
              collisionDetector={closestCenter}
            >
              <DragDropSensors />
              <ConstrainDragXAxis />
              <div class="flex max-h-52 w-full flex-col gap-1 overflow-y-auto px-3 py-3 no-scrollbar">
                <div class="px-2 pb-1 text-12-medium uppercase text-text-weak">Projects</div>
                <SortableProvider ids={props.projects().map((p) => p.worktree)}>
                  <For each={props.projects()}>{(project) => props.renderProject(project)}</For>
                </SortableProvider>
                <Tooltip
                  placement={placement()}
                  value={
                    <div class="flex items-center gap-2">
                      <span>{props.openProjectLabel}</span>
                      <Show when={!props.mobile && !!props.openProjectKeybind()}>
                        <span class="text-icon-base text-12-medium">{props.openProjectKeybind()}</span>
                      </Show>
                    </div>
                  }
                >
                  <Button
                    icon="plus"
                    variant="ghost"
                    size="normal"
                    class="mt-1 w-full justify-start rounded-sm border border-dashed border-border-weak-base bg-background-base text-text-base hover:border-border-interactive-base hover:bg-surface-interactive-weak"
                    onClick={props.onOpenProject}
                    aria-label={typeof props.openProjectLabel === "string" ? props.openProjectLabel : undefined}
                  >
                    <span class="min-w-0 truncate text-12-medium">{props.openProjectLabel}</span>
                  </Button>
                </Tooltip>
              </div>
              <DragOverlay>{props.renderProjectOverlay()}</DragOverlay>
            </DragDropProvider>
          </div>
        </div>

        <div
          ref={(el) => {
            panel = el
          }}
          classList={{ "flex-1 flex h-full min-h-0 min-w-0 overflow-hidden": true, "pointer-events-none": !expanded() }}
          aria-hidden={!expanded()}
        >
          {props.renderPanel()}
        </div>
      </Show>

      <div
        data-component="sidebar-footer"
        class="shrink-0 border-t border-border-weaker-base bg-background-stronger px-3 py-3"
        classList={{ "mt-auto": hierarchyMode() }}
      >
        <div class="flex items-center gap-1">
          <TooltipKeybind placement={placement()} title={props.settingsLabel()} keybind={props.settingsKeybind() ?? ""}>
            <IconButton
              icon="settings-gear"
              variant="ghost"
              size="normal"
              class="rounded-sm"
              onClick={props.onOpenSettings}
              aria-label={props.settingsLabel()}
            />
          </TooltipKeybind>
          <Tooltip placement={placement()} value={props.helpLabel()}>
            <IconButton
              icon="help"
              variant="ghost"
              size="normal"
              class="rounded-sm"
              onClick={props.onOpenHelp}
              aria-label={props.helpLabel()}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
