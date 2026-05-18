import type { Session } from "@opencode-ai/sdk/v2/client"
import { Avatar } from "@opencode-ai/ui/avatar"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Spinner } from "@opencode-ai/ui/spinner"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { getFilename } from "@opencode-ai/core/util/path"
import { A, useParams } from "@solidjs/router"
import { type Accessor, createMemo, For, type JSX, Match, Show, Switch } from "solid-js"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"
import { getAvatarColors, type LocalProject, useLayout } from "@/context/layout"
import { useNotification } from "@/context/notification"
import { usePermission } from "@/context/permission"
import { messageAgentColor } from "@/utils/agent"
import { sessionTitle } from "@/utils/session-title"
import { sessionPermissionRequest } from "../session/composer/session-request-tree"
import { childSessionOnPath, hasProjectPermissions } from "./helpers"

const OPENCODE_PROJECT_ID = "4b0ea68d7af9a6031a7ffda7ad66e0cb83315750"

export function getProjectAvatarSource(id?: string, icon?: { color?: string; url?: string; override?: string }) {
  if (id === OPENCODE_PROJECT_ID) return "https://opencode.ai/favicon.svg"
  if (icon?.override) return icon?.override
  if (icon?.color) return undefined
  return icon?.url
}

export const ProjectIcon = (props: {
  project: LocalProject
  class?: string
  notify?: boolean
  working?: boolean
}): JSX.Element => {
  const globalSync = useGlobalSync()
  const notification = useNotification()
  const permission = usePermission()
  const dirs = createMemo(() => [props.project.worktree, ...(props.project.sandboxes ?? [])])
  const unseenCount = createMemo(() =>
    dirs().reduce((total, directory) => total + notification.project.unseenCount(directory), 0),
  )
  const hasError = createMemo(() => dirs().some((directory) => notification.project.unseenHasError(directory)))
  const hasPermissions = createMemo(() =>
    dirs().some((directory) => {
      const [store] = globalSync.child(directory, { bootstrap: false })
      return hasProjectPermissions(store.permission, (item) => !permission.autoResponds(item, directory))
    }),
  )
  const notify = createMemo(() => props.notify && (hasPermissions() || unseenCount() > 0))
  const name = createMemo(() => props.project.name || getFilename(props.project.worktree))
  const src = createMemo(() => getProjectAvatarSource(props.project.id, props.project.icon))

  return (
    <div class={`relative size-8 shrink-0 rounded-sm ${props.class ?? ""}`}>
      <div class="size-full overflow-clip rounded-sm">
        <Show
          when={src()}
          fallback={
            <div
              class="flex size-full items-center justify-center rounded-sm border border-border-weak-base bg-surface-interactive-weak text-icon-interactive-base"
              classList={{ "badge-mask": notify() }}
              aria-hidden="true"
            >
              <Icon name="folder" size="small" />
            </div>
          }
        >
          {(source) => (
            <Avatar
              fallback={name()}
              src={source()}
              {...getAvatarColors(props.project.icon?.color)}
              class="size-full rounded-sm"
              classList={{ "badge-mask": notify() }}
            />
          )}
        </Show>
      </div>
      <Show when={notify()}>
        <div
          classList={{
            "absolute top-px right-px size-1.5 rounded-full z-10": true,
            "bg-surface-warning-strong": hasPermissions(),
            "bg-icon-critical-base": !hasPermissions() && hasError(),
            "bg-text-interactive-base": !hasPermissions() && !hasError(),
          }}
        />
      </Show>
      <Show when={props.working}>
        <div class="absolute bottom-px right-px size-3 rounded-full bg-background-base z-10 flex items-center justify-center">
          <Spinner class="size-[9px]" />
        </div>
      </Show>
    </div>
  )
}

export type SessionItemProps = {
  session: Session
  list: Session[]
  navList?: Accessor<Session[]>
  slug: string
  mobile?: boolean
  dense?: boolean
  compact?: boolean
  showTooltip?: boolean
  showChild?: boolean
  level?: number
  sidebarExpanded: Accessor<boolean>
  clearHoverProjectSoon: () => void
  prefetchSession: (session: Session, priority?: "high" | "low") => void
  archiveSession: (session: Session) => Promise<void>
}

const SessionRow = (props: {
  session: Session
  slug: string
  mobile?: boolean
  dense?: boolean
  compact?: boolean
  tint: Accessor<string | undefined>
  isWorking: Accessor<boolean>
  hasPermissions: Accessor<boolean>
  hasError: Accessor<boolean>
  unseenCount: Accessor<number>
  clearHoverProjectSoon: () => void
  sidebarOpened: Accessor<boolean>
  warmPress: () => void
  warmFocus: () => void
}): JSX.Element => {
  const title = () => sessionTitle(props.session.title)
  const status = () => props.isWorking() || props.hasPermissions() || props.hasError() || props.unseenCount() > 0

  return (
    <A
      href={`/${props.slug}/session/${props.session.id}`}
      classList={{
        "flex min-w-0 w-full items-center text-left focus:outline-none": true,
        "gap-2 py-0.5": props.dense,
        "gap-2 py-1": !props.dense && !props.compact,
        "gap-1.5 rounded-md px-2 py-1": props.compact,
      }}
      onPointerDown={props.warmPress}
      onFocus={props.warmFocus}
      onClick={() => {
        if (props.sidebarOpened()) return
        props.clearHoverProjectSoon()
      }}
    >
      <div
        class="flex shrink-0 items-center justify-center"
        classList={{ "size-6": !props.compact, "size-4": props.compact }}
          style={{ color: props.tint() ?? "var(--icon-interactive-base)" }}
        >
          <Switch>
            <Match when={props.isWorking()}>
              <Spinner class={props.compact ? "size-3" : "size-[15px]"} />
            </Match>
            <Match when={props.hasPermissions()}>
              <div class="size-1.5 rounded-full bg-surface-warning-strong" />
            </Match>
            <Match when={props.hasError()}>
              <div class="size-1.5 rounded-full bg-text-diff-delete-base" />
            </Match>
            <Match when={props.unseenCount() > 0}>
              <div class="size-1.5 rounded-full bg-text-interactive-base" />
            </Match>
            <Match when={props.compact && !status()}>
              <div class="size-1.5 rounded-full bg-text-weaker" />
            </Match>
          </Switch>
        </div>
      <span
        classList={{
          "min-w-0 flex-1 truncate text-text-strong": true,
          "text-14-regular": !props.compact,
          "text-13-regular": props.compact,
        }}
      >
        {title()}
      </span>
    </A>
  )
}

export const HierarchySessionItem = (props: {
  session: Session
  slug: string
  directory: string
  clearHoverProjectSoon: () => void
}): JSX.Element => {
  const layout = useLayout()
  const notification = useNotification()
  const globalSync = useGlobalSync()
  const [store] = globalSync.child(props.directory, { bootstrap: false })
  const title = () => sessionTitle(props.session.title)
  const isWorking = createMemo(() => store.session_working(props.session.id))
  const unseenCount = createMemo(() => notification.session.unseenCount(props.session.id))
  const hasError = createMemo(() => notification.session.unseenHasError(props.session.id))

  return (
    <div class="group/session relative w-full min-w-0 rounded-md pl-1 pr-1 shadow-none transition-colors hover:bg-surface-base-hover has-[.active]:bg-surface-base-active [&:has(:focus-visible)]:bg-surface-base-hover">
      <A
        href={`/${props.slug}/session/${props.session.id}`}
        class="flex min-w-0 w-full items-center gap-1.5 rounded-md px-2 py-1 text-left shadow-none focus:outline-none"
        onClick={() => {
          if (layout.sidebar.opened()) return
          props.clearHoverProjectSoon()
        }}
      >
        <div class="flex size-4 shrink-0 items-center justify-center">
          <Switch>
            <Match when={isWorking()}>
              <Spinner class="size-3" />
            </Match>
            <Match when={hasError()}>
              <div class="size-1.5 rounded-full bg-text-diff-delete-base" />
            </Match>
            <Match when={unseenCount() > 0}>
              <div class="size-1.5 rounded-full bg-text-interactive-base" />
            </Match>
            <Match when={true}>
              <div class="size-1.5 rounded-full bg-text-weaker" />
            </Match>
          </Switch>
        </div>
        <span class="min-w-0 flex-1 truncate text-13-regular text-text-strong">{title()}</span>
      </A>
    </div>
  )
}

export const SessionItem = (props: SessionItemProps): JSX.Element => {
  const params = useParams()
  const layout = useLayout()
  const language = useLanguage()
  const notification = useNotification()
  const permission = usePermission()
  const globalSync = useGlobalSync()
  const unseenCount = createMemo(() => notification.session.unseenCount(props.session.id))
  const hasError = createMemo(() => notification.session.unseenHasError(props.session.id))
  const [sessionStore] = globalSync.child(props.session.directory)
  const hasPermissions = createMemo(() => {
    return !!sessionPermissionRequest(sessionStore.session, sessionStore.permission, props.session.id, (item) => {
      return !permission.autoResponds(item, props.session.directory)
    })
  })
  const isWorking = createMemo(() => {
    if (hasPermissions()) return false
    return sessionStore.session_working(props.session.id)
  })

  const tint = createMemo(() => messageAgentColor(sessionStore.message[props.session.id], sessionStore.agent))
  const tooltip = createMemo(() => props.showTooltip ?? (props.mobile || !props.sidebarExpanded()))
  const currentChild = createMemo(() => {
    if (!props.showChild) return
    return childSessionOnPath(sessionStore.session, props.session.id, params.id)
  })

  const warm = (span: number, priority: "high" | "low") => {
    const nav = props.navList?.()
    const list = nav?.some((item) => item.id === props.session.id && item.directory === props.session.directory)
      ? nav
      : props.list

    props.prefetchSession(props.session, priority)

    const idx = list.findIndex((item) => item.id === props.session.id && item.directory === props.session.directory)
    if (idx === -1) return

    for (let step = 1; step <= span; step++) {
      const next = list[idx + step]
      if (next) props.prefetchSession(next, step === 1 ? "high" : priority)

      const prev = list[idx - step]
      if (prev) props.prefetchSession(prev, step === 1 ? "high" : priority)
    }
  }

  const item = (
    <SessionRow
      session={props.session}
      slug={props.slug}
      mobile={props.mobile}
      dense={props.dense}
      compact={props.compact}
      tint={tint}
      isWorking={isWorking}
      hasPermissions={hasPermissions}
      hasError={hasError}
      unseenCount={unseenCount}
      clearHoverProjectSoon={props.clearHoverProjectSoon}
      sidebarOpened={layout.sidebar.opened}
      warmPress={() => warm(2, "high")}
      warmFocus={() => warm(2, "high")}
    />
  )

  return (
    <>
      <div
        data-session-id={props.session.id}
        classList={{
          "group/session relative w-full min-w-0 cursor-default transition-colors": true,
          "rounded-md pl-1 pr-1 hover:bg-surface-raised-base-hover has-[.active]:bg-surface-raised-base-hover [&:has(:focus-visible)]:bg-surface-raised-base-hover":
            props.compact,
          "rounded-md pr-3 hover:bg-surface-raised-base-hover [&:has(:focus-visible)]:bg-surface-raised-base-hover has-[[data-expanded]]:bg-surface-raised-base-hover has-[.active]:bg-surface-base-active":
            !props.compact,
        }}
        style={{
          "padding-left": props.compact ? `${4 + (props.level ?? 0) * 12}px` : `${8 + (props.level ?? 0) * 16}px`,
        }}
      >
        <div class="flex min-w-0 items-center gap-1">
          <div class="min-w-0 flex-1">
            <Show
              when={!tooltip()}
              fallback={
                <Tooltip
                  placement={props.mobile ? "bottom" : "right"}
                  value={sessionTitle(props.session.title)}
                  gutter={10}
                  class="min-w-0 w-full"
                >
                  {item}
                </Tooltip>
              }
            >
              {item}
            </Show>
          </div>

          <Show when={!props.level && !props.compact}>
            <div
              class="shrink-0 overflow-hidden transition-[width,opacity]"
              classList={{
                "w-6 opacity-100 pointer-events-auto": !!props.mobile,
                "w-0 opacity-0 pointer-events-none": !props.mobile,
                "group-hover/session:w-6 group-hover/session:opacity-100 group-hover/session:pointer-events-auto": true,
                "group-focus-within/session:w-6 group-focus-within/session:opacity-100 group-focus-within/session:pointer-events-auto": true,
              }}
            >
              <Tooltip value={language.t("common.archive")} placement="top">
                <IconButton
                  icon="archive"
                  variant="ghost"
                  class="size-6 rounded-md"
                  aria-label={language.t("common.archive")}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void props.archiveSession(props.session)
                  }}
                />
              </Tooltip>
            </div>
          </Show>
        </div>
      </div>
      <Show when={currentChild()} keyed>
        {(child) => (
          <div class="w-full">
            <SessionItem {...props} session={child} level={(props.level ?? 0) + 1} />
          </div>
        )}
      </Show>
    </>
  )
}

export const NewSessionItem = (props: {
  slug: string
  mobile?: boolean
  dense?: boolean
  compact?: boolean
  sidebarExpanded: Accessor<boolean>
  clearHoverProjectSoon: () => void
}): JSX.Element => {
  const layout = useLayout()
  const language = useLanguage()
  const label = language.t("command.session.new")
  const tooltip = () => props.mobile || !props.sidebarExpanded()
  const item = (
    <A
      href={`/${props.slug}/session`}
      end
      classList={{
        "flex min-w-0 w-full items-center text-left focus:outline-none": true,
        "gap-2 py-0.5": props.dense,
        "gap-2 py-1": !props.dense && !props.compact,
        "gap-1.5 rounded-md px-2 py-1": props.compact,
      }}
      onClick={() => {
        if (layout.sidebar.opened()) return
        props.clearHoverProjectSoon()
      }}
    >
      <div
        class="flex shrink-0 items-center justify-center"
        classList={{ "size-6": !props.compact, "size-4": props.compact }}
      >
        <Icon name="new-session" size="small" class="text-icon-weak" />
      </div>
      <span
        classList={{
          "min-w-0 flex-1 truncate": true,
          "text-14-regular text-text-strong": !props.compact,
          "text-13-regular text-text-weak": props.compact,
        }}
      >
        {label}
      </span>
    </A>
  )

  return (
    <div
      classList={{
        "group/session relative w-full min-w-0 cursor-default transition-colors": true,
        "rounded-md pl-1 pr-1 hover:bg-surface-raised-base-hover has-[.active]:bg-surface-raised-base-hover [&:has(:focus-visible)]:bg-surface-raised-base-hover":
          props.compact,
        "rounded-md pl-2 pr-3 hover:bg-surface-raised-base-hover has-[.active]:bg-surface-base-active [&:has(:focus-visible)]:bg-surface-raised-base-hover":
          !props.compact,
      }}
    >
      <Show
        when={!tooltip()}
        fallback={
          <Tooltip placement={props.mobile ? "bottom" : "right"} value={label} gutter={10} class="min-w-0 w-full">
            {item}
          </Tooltip>
        }
      >
        {item}
      </Show>
    </div>
  )
}

export const SessionSkeleton = (props: { count?: number }): JSX.Element => {
  const items = Array.from({ length: props.count ?? 4 }, (_, index) => index)
  return (
    <div class="flex flex-col gap-1">
      <For each={items}>
        {() => <div class="h-8 w-full rounded-md bg-surface-raised-base opacity-60 animate-pulse" />}
      </For>
    </div>
  )
}
