import { describe, expect, test } from "bun:test"
import { DEFAULT_THEMES } from "./default-themes"

describe("default desktop themes", () => {
  test("registers the Codex theme while preserving OC-2", () => {
    expect(DEFAULT_THEMES["oc-2"]?.name).toBe("OC-2")
    expect(DEFAULT_THEMES.codex?.id).toBe("codex")
    expect(DEFAULT_THEMES.codex?.name).toBe("Codex")
  })
})
