import { base64Encode } from "@opencode-ai/core/util/encode"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { type LocalProject } from "@/context/layout"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"
import { createEffect, createMemo, For, onCleanup, Show, type Accessor, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { displayName, sortedRootSessions } from "./helpers"
import {
  HierarchySessionItem,
  NewSessionItem,
  SessionSkeleton,
  type SessionItemProps,
} from "./sidebar-items"
import type { ProjectSidebarContext } from "./sidebar-project"

const SESSION_PREVIEW_LIMIT = 12
const LOAD_STAGGER_MS = 120

export type SidebarHierarchyContext = {
  projects: Accessor<LocalProject[]>
  sortNow: Accessor<number>
  ctx: ProjectSidebarContext
  sessionProps: Omit<SessionItemProps, "session" | "list" | "slug" | "mobile" | "dense" | "compact">
  workspaceIds: (project: LocalProject) => string[]
  workspacesEnabled: (project: LocalProject) => boolean
  workspaceLabel: (directory: string, branch?: string, projectId?: string) => string
  onOpenProject: () => void
  openProjectLabel: string
  navigateToProject: (directory: string) => void
}

const DirectorySessions = (props: {
  directory: string
  slug: string
  sortNow: Accessor<number>
  sessionProps: SidebarHierarchyContext["sessionProps"]
  workspaceLabel?: string
  mobile?: boolean
  onViewAll: () => void
}): JSX.Element => {
  const language = useLanguage()
  const globalSync = useGlobalSync()
  const [store] = globalSync.child(props.directory, { bootstrap: false })
  const sessions = createMemo(() => sortedRootSessions(store, props.sortNow()))
  const loading = createMemo(() => store.session === undefined)
  const preview = createMemo(() => sessions().slice(0, SESSION_PREVIEW_LIMIT))
  const hidden = createMemo(() => Math.max(0, sessions().length - preview().length))

  return (
    <div class="flex flex-col gap-0.5 pb-1 pl-1">
      <Show when={props.workspaceLabel}>
        <div class="truncate px-2 py-0.5 text-11-medium text-text-weaker">{props.workspaceLabel}</div>
      </Show>
      <Show when={loading()}>
        <SessionSkeleton count={2} />
      </Show>
      <Show when={!loading()}>
        <NewSessionItem
          slug={props.slug}
          mobile={props.mobile}
          compact
          sidebarExpanded={props.sessionProps.sidebarExpanded}
          clearHoverProjectSoon={props.sessionProps.clearHoverProjectSoon}
        />
        <For each={preview()}>
          {(session) => (
            <HierarchySessionItem
              session={session}
              slug={props.slug}
              directory={props.directory}
              clearHoverProjectSoon={props.sessionProps.clearHoverProjectSoon}
            />
          )}
        </For>
        <Show when={hidden() > 0}>
          <button
            type="button"
            class="w-full truncate rounded-md px-2 py-1 text-left text-12-regular text-text-weak hover:bg-surface-base-hover hover:text-text-base"
            onClick={props.onViewAll}
          >
            {language.t("sidebar.project.viewAllSessions")} ({hidden()})
          </button>
        </Show>
      </Show>
    </div>
  )
}

const ProjectBlock = (props: {
  project: LocalProject
  hierarchy: SidebarHierarchyContext
  expanded: Accessor<boolean>
  onToggle: () => void
  mobile?: boolean
}): JSX.Element => {
  const globalSync = useGlobalSync()
  const workspacesEnabled = () => props.hierarchy.workspacesEnabled(props.project)
  const selected = createMemo(() => props.hierarchy.ctx.currentProject()?.worktree === props.project.worktree)

  const directories = createMemo(() => {
    if (!props.expanded()) return [] as string[]
    if (!workspacesEnabled()) return [props.project.worktree]
    return props.hierarchy.workspaceIds(props.project)
  })

  const workspaceEntries = createMemo(() => {
    if (!workspacesEnabled()) return [{ directory: props.project.worktree, label: undefined as string | undefined }]
    const dirs = directories()
    if (dirs.length <= 1) return [{ directory: props.project.worktree, label: undefined }]
    return dirs.map((directory) => {
      const [data] = globalSync.child(directory, { bootstrap: false })
      const label =
        directory === props.project.worktree
          ? undefined
          : props.hierarchy.workspaceLabel(directory, data.vcs?.branch, props.project.id)
      return { directory, label }
    })
  })

  const viewAll = (directory: string) => {
    props.hierarchy.navigateToProject(directory)
  }

  return (
    <section
      data-component="sidebar-project-block"
      class="flex flex-col"
      style={{ "content-visibility": props.expanded() ? "visible" : "auto" }}
    >
      <div class="mt-3 flex min-w-0 items-center gap-0.5 first:mt-0">
        <button
          type="button"
          class="flex size-6 shrink-0 items-center justify-center rounded-sm text-icon-weak hover:bg-surface-base-hover"
          aria-expanded={props.expanded()}
          aria-label={displayName(props.project)}
          onClick={(event) => {
            event.stopPropagation()
            props.onToggle()
          }}
        >
          <Icon name={props.expanded() ? "chevron-down" : "chevron-right"} size="small" />
        </button>
        <button
          type="button"
          data-action="project-switch"
          class="group/project-label flex min-w-0 flex-1 items-center rounded-sm px-1 py-1 text-left shadow-none hover:bg-surface-base-hover"
          classList={{ "bg-surface-base-active": selected() }}
          onClick={() => props.hierarchy.navigateToProject(props.project.worktree)}
        >
          <span class="truncate text-12-medium text-text-weak group-hover/project-label:text-text-base">
            {displayName(props.project)}
          </span>
        </button>
      </div>

      <Show when={props.expanded()}>
        <For each={workspaceEntries()}>
          {(entry) => (
            <DirectorySessions
              directory={entry.directory}
              slug={base64Encode(entry.directory)}
              sortNow={props.hierarchy.sortNow}
              sessionProps={props.hierarchy.sessionProps}
              workspaceLabel={entry.label}
              mobile={props.mobile}
              onViewAll={() => viewAll(entry.directory)}
            />
          )}
        </For>
      </Show>
    </section>
  )
}

export const SidebarHierarchy = (props: {
  hierarchy: SidebarHierarchyContext
  mobile?: boolean
}): JSX.Element => {
  const globalSync = useGlobalSync()
  const [ui, setUi] = createStore({
    expanded: {} as Record<string, boolean>,
  })

  const isExpanded = (worktree: string) => {
    const manual = ui.expanded[worktree]
    if (manual !== undefined) return manual
    return props.hierarchy.ctx.currentProject()?.worktree === worktree
  }

  createEffect(() => {
    const current = props.hierarchy.ctx.currentProject()?.worktree
    if (!current) return
    setUi("expanded", current, true)
  })

  createEffect(() => {
    const directories: string[] = []
    for (const project of props.hierarchy.projects()) {
      if (!isExpanded(project.worktree)) continue
      if (props.hierarchy.workspacesEnabled(project)) {
        for (const directory of props.hierarchy.workspaceIds(project)) {
          directories.push(directory)
        }
        continue
      }
      directories.push(project.worktree)
    }
    if (directories.length === 0) return

    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    void (async () => {
      const seen = new Set<string>()
      for (const directory of directories) {
        if (cancelled || seen.has(directory)) continue
        seen.add(directory)
        await globalSync.project.loadSessions(directory)
        if (cancelled) return
        await new Promise((resolve) => setTimeout(resolve, LOAD_STAGGER_MS))
      }
    })()
  })

  return (
    <div
      data-component="sidebar-hierarchy"
      class="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2 no-scrollbar"
    >
      <For each={props.hierarchy.projects()}>
        {(project) => (
          <ProjectBlock
            project={project}
            hierarchy={props.hierarchy}
            expanded={() => isExpanded(project.worktree)}
            onToggle={() => {
              const next = !isExpanded(project.worktree)
              setUi("expanded", project.worktree, next)
            }}
            mobile={props.mobile}
          />
        )}
      </For>

      <Button
        icon="plus"
        variant="ghost"
        size="normal"
        class="mt-2 w-full justify-start rounded-sm border border-dashed border-border-weak-base px-2 text-12-medium text-text-weak hover:border-border-interactive-base hover:bg-surface-interactive-weak"
        onClick={props.hierarchy.onOpenProject}
      >
        <span class="min-w-0 truncate">{props.hierarchy.openProjectLabel}</span>
      </Button>
    </div>
  )
}
