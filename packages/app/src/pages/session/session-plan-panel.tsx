import type { Todo } from "@opencode-ai/sdk/v2"
import { useSpring } from "@opencode-ai/ui/motion-spring"
import { createMemo, Show } from "solid-js"
import { useLanguage } from "@/context/language"
import { SessionTodoList } from "@/pages/session/composer/session-todo-list"

export function SessionPlanPanel(props: { todos: Todo[]; hidden: boolean }) {
  const language = useLanguage()
  const visible = createMemo(() => !props.hidden && props.todos.length > 0)
  const progress = useSpring(() => (visible() ? 1 : 0), { visualDuration: 0.24, bounce: 0 })
  const value = createMemo(() => Math.max(0, Math.min(1, progress())))

  return (
    <Show when={visible() || value() > 0.01}>
      <aside
        data-component="session-plan-panel"
        class="pointer-events-none absolute right-3 z-20 hidden md:block"
        style={{
          top: "calc(var(--session-title-height, 48px) + 12px)",
          opacity: `${value()}`,
          transform: `translateX(${(1 - value()) * 12}px)`,
        }}
        aria-hidden={!visible()}
      >
        <div class="pointer-events-auto w-max max-w-[min(260px,32vw)] rounded-lg border border-border-weak-base bg-background-base shadow-[var(--shadow-md-border-base)]">
          <div class="px-3 pt-2 pb-1 text-12-regular text-text-weak">
            {language.t("session.plan.title")}
          </div>
          <SessionTodoList todos={props.todos} compact />
        </div>
      </aside>
    </Show>
  )
}
