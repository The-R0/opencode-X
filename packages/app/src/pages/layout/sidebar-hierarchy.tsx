import { base64Encode } from "@opencode-ai/core/util/encode"
import { Collapsible } from "@opencode-ai/ui/collapsible"
import { ContextMenu } from "@opencode-ai/ui/context-menu"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { type Session } from "@opencode-ai/sdk/v2/client"
import { useNavigate } from "@solidjs/router"
import { type LocalProject } from "@/context/layout"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"
import { useNotification } from "@/context/notification"
import { createEffect, createMemo, createSignal, For, onCleanup, Show, type Accessor, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { displayName, sortedRootSessions } from "./helpers"
import {
  cycleHierarchyProjectIcon,
  HierarchySessionItem,
  ProjectIcon,
  readHierarchyProjectIcon,
  SessionSkeleton,
  type HierarchyProjectIcon,
  type SessionItemProps,
} from "./sidebar-items"
import type { ProjectSidebarContext } from "./sidebar-project"
import type { WorkspaceSidebarContext } from "./sidebar-workspace"

const SESSION_PREVIEW_LIMIT = 12
/** Defer session list fetch so the window can paint first (reduces startup jank). */
const SESSION_LOAD_DEFER_MS = 250

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
  InlineEditor: WorkspaceSidebarContext["InlineEditor"]
  openEditor: WorkspaceSidebarContext["openEditor"]
  renameProject: (project: LocalProject, next: string) => void
  renameSession: (session: Session, next: string) => void
  clearHoverProjectSoon: () => void
}

const HierarchyProjectMenu = (props: {
  project: LocalProject
  hierarchy: SidebarHierarchyContext
  children: JSX.Element
}): JSX.Element => {
  const language = useLanguage()
  const notification = useNotification()
  const ctx = props.hierarchy.ctx
  const dirs = createMemo(() => {
    if (!props.hierarchy.workspacesEnabled(props.project)) return [props.project.worktree]
    return props.hierarchy.workspaceIds(props.project)
  })
  const unseenCount = createMemo(() =>
    dirs().reduce((total, directory) => total + notification.project.unseenCount(directory), 0),
  )
  const clearNotifications = () =>
    dirs()
      .filter((directory) => notification.project.unseenCount(directory) > 0)
      .forEach((directory) => notification.project.markViewed(directory))

  return (
    <ContextMenu>
      <ContextMenu.Trigger as="div" class="contents">
        {props.children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => ctx.showEditProjectDialog(props.project)}>
            <ContextMenu.ItemLabel>{language.t("common.edit")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Item
            disabled={props.project.vcs !== "git" && !props.hierarchy.workspacesEnabled(props.project)}
            onSelect={() => ctx.toggleProjectWorkspaces(props.project)}
          >
            <ContextMenu.ItemLabel>
              {props.hierarchy.workspacesEnabled(props.project)
                ? language.t("sidebar.workspaces.disable")
                : language.t("sidebar.workspaces.enable")}
            </ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Item disabled={unseenCount() === 0} onSelect={clearNotifications}>
            <ContextMenu.ItemLabel>{language.t("sidebar.project.clearNotifications")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={() => ctx.closeProject(props.project.worktree)}>
            <ContextMenu.ItemLabel>{language.t("common.close")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  )
}

const HierarchyProjectDropdown = (props: {
  project: LocalProject
  hierarchy: SidebarHierarchyContext
}): JSX.Element => {
  const language = useLanguage()
  const notification = useNotification()
  const ctx = props.hierarchy.ctx
  const dirs = createMemo(() => {
    if (!props.hierarchy.workspacesEnabled(props.project)) return [props.project.worktree]
    return props.hierarchy.workspaceIds(props.project)
  })
  const unseenCount = createMemo(() =>
    dirs().reduce((total, directory) => total + notification.project.unseenCount(directory), 0),
  )
  const clearNotifications = () =>
    dirs()
      .filter((directory) => notification.project.unseenCount(directory) > 0)
      .forEach((directory) => notification.project.markViewed(directory))

  return (
    <DropdownMenu>
      <Tooltip value={language.t("common.moreOptions")} placement="top">
        <DropdownMenu.Trigger
          as={IconButton}
          icon="dot-grid"
          variant="ghost"
          class="size-6 shrink-0 rounded-sm opacity-0 pointer-events-none text-icon-weak transition-opacity group-hover/project-header:opacity-100 group-hover/project-header:pointer-events-auto group-focus-within/project-header:opacity-100 group-focus-within/project-header:pointer-events-auto"
          data-action="project-menu"
          data-project={base64Encode(props.project.worktree)}
          aria-label={language.t("common.moreOptions")}
          onClick={(event) => event.stopPropagation()}
        />
      </Tooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => ctx.showEditProjectDialog(props.project)}>
            <DropdownMenu.ItemLabel>{language.t("common.edit")}</DropdownMenu.ItemLabel>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={props.project.vcs !== "git" && !props.hierarchy.workspacesEnabled(props.project)}
            onSelect={() => ctx.toggleProjectWorkspaces(props.project)}
          >
            <DropdownMenu.ItemLabel>
              {props.hierarchy.workspacesEnabled(props.project)
                ? language.t("sidebar.workspaces.disable")
                : language.t("sidebar.workspaces.enable")}
            </DropdownMenu.ItemLabel>
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled={unseenCount() === 0} onSelect={clearNotifications}>
            <DropdownMenu.ItemLabel>{language.t("sidebar.project.clearNotifications")}</DropdownMenu.ItemLabel>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => ctx.closeProject(props.project.worktree)}>
            <DropdownMenu.ItemLabel>{language.t("common.close")}</DropdownMenu.ItemLabel>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  )
}

const DirectorySessions = (props: {
  directory: string
  slug: string
  sortNow: Accessor<number>
  hierarchy: SidebarHierarchyContext
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
    <div class="flex flex-col gap-0.5 pb-1">
      <Show when={props.workspaceLabel}>
        <div class="truncate px-2 py-0.5 text-12-regular text-text-weaker">{props.workspaceLabel}</div>
      </Show>
      <Show when={loading()}>
        <SessionSkeleton count={2} />
      </Show>
      <Show when={!loading()}>
        <For each={preview()}>
          {(session) => (
            <HierarchySessionItem
              session={session}
              slug={props.slug}
              directory={props.directory}
              clearHoverProjectSoon={props.sessionProps.clearHoverProjectSoon}
              InlineEditor={props.hierarchy.InlineEditor}
              openEditor={props.hierarchy.openEditor}
              renameSession={props.hierarchy.renameSession}
              archiveSession={props.sessionProps.archiveSession}
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
  onExpandedChange: (open: boolean) => void
  projectIcon: Accessor<HierarchyProjectIcon>
  onProjectIconCycle: () => void
  mobile?: boolean
}): JSX.Element => {
  const navigate = useNavigate()
  const language = useLanguage()
  const globalSync = useGlobalSync()
  const workspacesEnabled = () => props.hierarchy.workspacesEnabled(props.project)
  const projectEditorId = () => `project:${props.project.id ?? props.project.worktree}`
  const projectSlug = () => base64Encode(props.project.worktree)
  const active = createMemo(() => props.hierarchy.ctx.currentProject()?.worktree === props.project.worktree)

  const directories = createMemo(() => {
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
    <Collapsible
      data-component="sidebar-project-block"
      variant="ghost"
      class="flex flex-col"
      open={props.expanded()}
      onOpenChange={(open) => {
        if (open !== props.expanded()) props.onExpandedChange(open)
      }}
    >
      <HierarchyProjectMenu project={props.project} hierarchy={props.hierarchy}>
        <div class="group/project-header mt-2 first:mt-0">
          <div
          class="flex min-w-0 items-center gap-0.5 rounded-md border px-1 py-0.5 transition-colors"
          classList={{
            "border-border-weak-base": active(),
            "border-transparent": !active() && !props.expanded(),
            "border-border-weaker-base/50": !active() && props.expanded(),
            "hover:border-border-weak-base/60": !active(),
          }}
        >
          <Collapsible.Trigger
            class="flex size-6 shrink-0 items-center justify-center rounded-sm text-icon-weak hover:bg-surface-base-hover hover:text-icon-base"
            aria-label={displayName(props.project)}
            onClick={(event) => event.stopPropagation()}
          >
            <span data-slot="hierarchy-chevron" data-expanded={props.expanded() ? "true" : "false"}>
              <Icon name="chevron-right" size="small" />
            </span>
          </Collapsible.Trigger>
          <button
            type="button"
            data-action="project-switch"
            class="group/project-label flex min-w-0 flex-1 items-center gap-1.5 rounded-sm px-0.5 py-0.5 text-left shadow-none"
            onClick={() => props.hierarchy.navigateToProject(props.project.worktree)}
          >
            <ProjectIcon
              project={props.project}
              iconStyle={props.projectIcon()}
              glyphVariant="plain"
              onIconStyleCycle={props.onProjectIconCycle}
            />
            <props.hierarchy.InlineEditor
              id={projectEditorId()}
              value={() => displayName(props.project)}
              onSave={(next) => {
                void props.hierarchy.renameProject(props.project, next)
              }}
              class="min-w-0 truncate text-12-medium text-text-base group-hover/project-label:text-text-strong"
              displayClass="min-w-0 truncate text-12-medium text-text-base group-hover/project-label:text-text-strong"
              openOnDblClick={false}
              stopPropagation
            />
          </button>
          <HierarchyProjectDropdown project={props.project} hierarchy={props.hierarchy} />
          <Tooltip value={language.t("command.session.new")} placement="top">
            <IconButton
              icon="new-session"
              variant="ghost"
              class="size-6 shrink-0 rounded-sm opacity-0 pointer-events-none text-icon-weak transition-opacity group-hover/project-header:opacity-100 group-hover/project-header:pointer-events-auto group-focus-within/project-header:opacity-100 group-focus-within/project-header:pointer-events-auto"
              data-action="project-new-session"
              data-project={projectSlug()}
              aria-label={language.t("command.session.new")}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                props.hierarchy.clearHoverProjectSoon()
                navigate(`/${projectSlug()}/session`)
              }}
            />
          </Tooltip>
        </div>
        </div>
      </HierarchyProjectMenu>

      <Collapsible.Content>
        <div
          data-slot="hierarchy-project-sessions"
          class="ml-3 w-[calc(100%-0.75rem)] border-l border-border-weaker-base pl-2"
        >
          <For each={workspaceEntries()}>
            {(entry) => (
              <DirectorySessions
                directory={entry.directory}
                slug={base64Encode(entry.directory)}
                sortNow={props.hierarchy.sortNow}
                hierarchy={props.hierarchy}
                sessionProps={props.hierarchy.sessionProps}
                workspaceLabel={entry.label}
                mobile={props.mobile}
                onViewAll={() => viewAll(entry.directory)}
              />
            )}
          </For>
        </div>
      </Collapsible.Content>
    </Collapsible>
  )
}

export const SidebarHierarchy = (props: {
  hierarchy: SidebarHierarchyContext
  mobile?: boolean
}): JSX.Element => {
  const globalSync = useGlobalSync()
  const [projectIcon, setProjectIcon] = createSignal(readHierarchyProjectIcon())
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
    const timer = window.setTimeout(() => {
      void (async () => {
        const seen = new Set<string>()
        const pending = directories.filter((directory) => {
          if (seen.has(directory)) return false
          seen.add(directory)
          return true
        })
        await Promise.all(
          pending.map(async (directory) => {
            if (cancelled) return
            await globalSync.project.loadSessions(directory)
          }),
        )
      })()
    }, SESSION_LOAD_DEFER_MS)

    onCleanup(() => {
      cancelled = true
      window.clearTimeout(timer)
    })
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
            onExpandedChange={(open) => {
              setUi("expanded", project.worktree, open)
            }}
            projectIcon={projectIcon}
            onProjectIconCycle={() => setProjectIcon(cycleHierarchyProjectIcon(projectIcon()))}
            mobile={props.mobile}
          />
        )}
      </For>
    </div>
  )
}
