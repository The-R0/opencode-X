import { Button } from "@opencode-ai/ui/button"
import { Dialog } from "@opencode-ai/ui/dialog"
import { DropdownMenu } from "@opencode-ai/ui/dropdown-menu"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { TextField } from "@opencode-ai/ui/text-field"
import { showToast } from "@opencode-ai/ui/toast"
import type { Session } from "@opencode-ai/sdk/v2/client"
import { Binary } from "@opencode-ai/core/util/binary"
import { Popover as KobaltePopover } from "@kobalte/core/popover"
import { useMutation } from "@tanstack/solid-query"
import { useNavigate, useParams } from "@solidjs/router"
import { createMemo, createSignal, Show } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useGlobalSDK } from "@/context/global-sdk"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { sessionTitle } from "@/utils/session-title"
import type { WorkspaceSidebarContext } from "@/pages/layout/sidebar-workspace"

const errorMessage = (language: ReturnType<typeof useLanguage>, err: unknown) => {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  if (err instanceof Error) return err.message
  return language.t("common.requestFailed")
}

function DialogDeleteSession(props: { sessionID: string; directory: string }) {
  const dialog = useDialog()
  const language = useLanguage()
  const globalSync = useGlobalSync()
  const globalSDK = useGlobalSDK()
  const navigate = useNavigate()
  const params = useParams()
  const [, setStore] = globalSync.child(props.directory, { bootstrap: false })

  const name = createMemo(() => {
    const [store] = globalSync.child(props.directory, { bootstrap: false })
    const session = store.session?.find((s) => s.id === props.sessionID)
    return sessionTitle(session?.title) ?? language.t("command.session.new")
  })

  const handleDelete = async () => {
    const [store] = globalSync.child(props.directory, { bootstrap: false })
    const session = store.session?.find((s) => s.id === props.sessionID)
    if (!session) {
      dialog.close()
      return
    }

    const sessions = (store.session ?? []).filter((s) => !s.parentID && !s.time?.archived)
    const index = sessions.findIndex((s) => s.id === props.sessionID)
    const nextSession = index === -1 ? undefined : (sessions[index + 1] ?? sessions[index - 1])

    const result = await globalSDK.client.session
      .delete({ directory: props.directory, sessionID: props.sessionID })
      .then((x) => x.data)
      .catch((err) => {
        showToast({
          title: language.t("session.delete.failed.title"),
          description: errorMessage(language, err),
        })
        return false
      })

    if (!result) return

    setStore(
      produce((draft) => {
        const removed = new Set<string>([props.sessionID])
        const byParent = new Map<string, string[]>()
        for (const item of draft.session) {
          const parentID = item.parentID
          if (!parentID) continue
          const existing = byParent.get(parentID)
          if (existing) {
            existing.push(item.id)
            continue
          }
          byParent.set(parentID, [item.id])
        }

        const queue = [props.sessionID]
        while (queue.length > 0) {
          const id = queue.pop()
          if (!id) continue
          const children = byParent.get(id) ?? []
          for (const child of children) {
            if (removed.has(child)) continue
            removed.add(child)
            queue.push(child)
          }
        }

        draft.session = draft.session.filter((item) => !removed.has(item.id))
      }),
    )

    if (params.id === props.sessionID) {
      if (session.parentID) {
        navigate(`/${params.dir}/session/${session.parentID}`)
      } else if (nextSession?.id) {
        navigate(`/${params.dir}/session/${nextSession.id}`)
      } else {
        navigate(`/${params.dir}/session`)
      }
    }

    dialog.close()
  }

  return (
    <Dialog title={language.t("session.delete.title")} fit>
      <div class="flex flex-col gap-4 pl-6 pr-2.5 pb-3">
        <span class="text-14-regular text-text-strong">
          {language.t("session.delete.confirm", { name: name() })}
        </span>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="large" onClick={() => dialog.close()}>
            {language.t("common.cancel")}
          </Button>
          <Button variant="primary" size="large" onClick={handleDelete}>
            {language.t("session.delete.button")}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function SessionMoreMenu(props: {
  session: Session
  openEditor?: WorkspaceSidebarContext["openEditor"]
  renameSession?: (session: Session, next: string) => void
  archiveSession?: (session: Session) => Promise<void>
  class?: string
}) {
  const dialog = useDialog()
  const language = useLanguage()
  const platform = usePlatform()
  const globalSDK = useGlobalSDK()
  const globalSync = useGlobalSync()
  const navigate = useNavigate()
  const params = useParams()

  const [, setStore] = globalSync.child(props.session.directory, { bootstrap: false })
  const [store] = globalSync.child(props.session.directory, { bootstrap: false })

  const sessionEditorId = () => `session:${props.session.id}`
  const title = createMemo(() => sessionTitle(props.session.title) ?? "")
  const shareUrl = createMemo(() => props.session.share?.url)
  const shareEnabled = createMemo(() => store.config.share !== "disabled")
  const isChild = () => !!props.session.parentID

  const [menu, setMenu] = createStore({
    open: false,
    pendingRename: false,
    pendingShare: false,
  })
  const [share, setShare] = createStore({
    open: false,
    dismiss: null as "escape" | "outside" | null,
  })

  let more: HTMLButtonElement | undefined

  const shareMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      globalSDK.client.session.share({ sessionID: id, directory: props.session.directory }),
    onError: (err) => console.error("Failed to share session", err),
  }))

  const unshareMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      globalSDK.client.session.unshare({ sessionID: id, directory: props.session.directory }),
    onError: (err) => console.error("Failed to unshare session", err),
  }))

  const viewShare = () => {
    const url = shareUrl()
    if (!url) return
    platform.openLink(url)
  }

  const shareSession = () => {
    if (shareMutation.isPending || !shareEnabled()) return
    shareMutation.mutate(props.session.id)
  }

  const unshareSession = () => {
    if (unshareMutation.isPending || !shareEnabled()) return
    unshareMutation.mutate(props.session.id)
  }

  const archive = async () => {
    if (props.archiveSession) {
      await props.archiveSession(props.session)
      return
    }

    const sessions = store.session ?? []
    const index = sessions.findIndex((s) => s.id === props.session.id)
    const nextSession = sessions[index + 1] ?? sessions[index - 1]

    await globalSDK.client.session
      .update({
        directory: props.session.directory,
        sessionID: props.session.id,
        time: { archived: Date.now() },
      })
      .then(() => {
        setStore(
          produce((draft) => {
            const match = Binary.search(draft.session, props.session.id, (s) => s.id)
            if (match.found) draft.session.splice(match.index, 1)
          }),
        )
        if (params.id === props.session.id) {
          if (props.session.parentID) {
            navigate(`/${params.dir}/session/${props.session.parentID}`)
          } else if (nextSession?.id) {
            navigate(`/${params.dir}/session/${nextSession.id}`)
          } else {
            navigate(`/${params.dir}/session`)
          }
        }
      })
      .catch((err) => {
        showToast({
          title: language.t("common.requestFailed"),
          description: errorMessage(language, err),
        })
      })
  }

  const startRename = () => {
    if (!props.openEditor) return
    setMenu("pendingRename", true)
    setMenu("open", false)
  }

  return (
    <Show when={!isChild()}>
      <div
        classList={{
          "shrink-0 overflow-hidden transition-[width,opacity]": true,
          "w-6 opacity-100": menu.open || share.open,
          "w-0 opacity-0 pointer-events-none": !menu.open && !share.open,
          "group-hover/session:w-6 group-hover/session:opacity-100 group-hover/session:pointer-events-auto": true,
          "group-focus-within/session:w-6 group-focus-within/session:opacity-100 group-focus-within/session:pointer-events-auto":
            true,
          [props.class ?? ""]: !!props.class,
        }}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DropdownMenu
          gutter={4}
          placement="bottom-end"
          open={menu.open}
          onOpenChange={(open) => setMenu("open", open)}
        >
          <DropdownMenu.Trigger
            as={IconButton}
            icon="dot-grid"
            variant="ghost"
            class="size-6 rounded-md data-[expanded]:bg-surface-base-active"
            classList={{
              "bg-surface-base-active": share.open || menu.pendingShare,
            }}
            aria-label={language.t("common.moreOptions")}
            aria-expanded={menu.open || share.open || menu.pendingShare}
            ref={(el: HTMLButtonElement) => {
              more = el
            }}
          />
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              style={{ "min-width": "104px" }}
              onCloseAutoFocus={(event) => {
                if (menu.pendingRename && props.openEditor) {
                  event.preventDefault()
                  setMenu("pendingRename", false)
                  props.openEditor(sessionEditorId(), title())
                  return
                }
                if (menu.pendingShare) {
                  event.preventDefault()
                  requestAnimationFrame(() => {
                    setShare({ open: true, dismiss: null })
                    setMenu("pendingShare", false)
                  })
                }
              }}
            >
              <DropdownMenu.Item onSelect={startRename}>
                <DropdownMenu.ItemLabel>{language.t("common.rename")}</DropdownMenu.ItemLabel>
              </DropdownMenu.Item>
              <Show when={shareEnabled()}>
                <DropdownMenu.Item
                  onSelect={() => {
                    setMenu({ pendingShare: true, open: false })
                  }}
                >
                  <DropdownMenu.ItemLabel>{language.t("session.share.action.share")}</DropdownMenu.ItemLabel>
                </DropdownMenu.Item>
              </Show>
              <DropdownMenu.Item onSelect={() => void archive()}>
                <DropdownMenu.ItemLabel>{language.t("common.archive")}</DropdownMenu.ItemLabel>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onSelect={() => dialog.show(() => <DialogDeleteSession sessionID={props.session.id} directory={props.session.directory} />)}
              >
                <DropdownMenu.ItemLabel>{language.t("common.delete")}</DropdownMenu.ItemLabel>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu>

        <KobaltePopover
          open={share.open}
          anchorRef={() => more}
          placement="bottom-end"
          gutter={4}
          modal={false}
          onOpenChange={(open) => {
            if (open) setShare("dismiss", null)
            setShare("open", open)
          }}
        >
          <KobaltePopover.Portal>
            <KobaltePopover.Content
              data-component="popover-content"
              style={{ "min-width": "320px" }}
              onEscapeKeyDown={(event) => {
                setShare({ dismiss: "escape", open: false })
                event.preventDefault()
                event.stopPropagation()
              }}
              onPointerDownOutside={() => setShare({ dismiss: "outside", open: false })}
              onFocusOutside={() => setShare({ dismiss: "outside", open: false })}
              onCloseAutoFocus={(event) => {
                if (share.dismiss === "outside") event.preventDefault()
                setShare("dismiss", null)
              }}
            >
              <div class="flex flex-col p-3">
                <div class="flex flex-col gap-1">
                  <div class="text-13-medium text-text-strong">
                    {language.t("session.share.popover.title")}
                  </div>
                  <div class="text-12-regular text-text-weak">
                    {shareUrl()
                      ? language.t("session.share.popover.description.shared")
                      : language.t("session.share.popover.description.unshared")}
                  </div>
                </div>
                <div class="mt-3 flex flex-col gap-2">
                  <Show
                    when={shareUrl()}
                    fallback={
                      <Button
                        size="large"
                        variant="primary"
                        class="w-full"
                        onClick={shareSession}
                        disabled={shareMutation.isPending}
                      >
                        {shareMutation.isPending
                          ? language.t("session.share.action.publishing")
                          : language.t("session.share.action.publish")}
                      </Button>
                    }
                  >
                    <div class="flex flex-col gap-2">
                      <TextField
                        value={shareUrl() ?? ""}
                        readOnly
                        copyable
                        copyKind="link"
                        tabIndex={-1}
                        class="w-full"
                      />
                      <div class="grid grid-cols-2 gap-2">
                        <Button
                          size="large"
                          variant="secondary"
                          class="w-full shadow-none border border-border-weak-base"
                          onClick={unshareSession}
                          disabled={unshareMutation.isPending}
                        >
                          {unshareMutation.isPending
                            ? language.t("session.share.action.unpublishing")
                            : language.t("session.share.action.unpublish")}
                        </Button>
                        <Button
                          size="large"
                          variant="primary"
                          class="w-full"
                          onClick={viewShare}
                          disabled={unshareMutation.isPending}
                        >
                          {language.t("session.share.action.view")}
                        </Button>
                      </div>
                    </div>
                  </Show>
                </div>
              </div>
            </KobaltePopover.Content>
          </KobaltePopover.Portal>
        </KobaltePopover>
      </div>
    </Show>
  )
}
