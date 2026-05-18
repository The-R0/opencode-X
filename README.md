# Opencodex

<p align="center">
  <strong>English</strong> · <a href="README.zh.md">简体中文</a>
</p>

**Opencodex** is this repository; the installed app is still **OpenCode** and shares configuration with the official desktop build.

Unofficial fork of [opencode](https://github.com/anomalyco/opencode) focused on **desktop (Electron)** UX (hierarchy sidebar, Codex theme, etc.). Same engine as upstream — **API keys, models, and auth use the same paths as official OpenCode desktop**.

| Data | Path (Windows) |
|------|----------------|
| Desktop shell settings, window state | `%APPDATA%\ai.opencode.desktop\` |
| Models / API keys / auth | `%APPDATA%\opencode\` |

> Not affiliated with the OpenCode team.

## Highlights

## UI differences from official OpenCode

Opencodex keeps the same OpenCode engine and configuration paths, but the desktop UI is intentionally different. The biggest change is the left sidebar: projects are treated as first-class workspace blocks, and recent sessions live under the project they belong to.

### Sidebar before and after

| Official OpenCode | Current Opencodex |
|-------------------|-------------------|
| <img src="./docs/assets/ui-differences/sidebar-before.png" alt="Official OpenCode sidebar with a vertical project avatar rail and the selected project panel." width="260"> | <img src="./docs/assets/ui-differences/sidebar-after.png" alt="Current Opencodex sidebar with search, project tree, fixed open-project action, and bottom tools." width="320"> |

### Toolbar before and after

| Official OpenCode | Current Opencodex |
|-------------------|-------------------|
| <img src="./docs/assets/ui-differences/toolbar-before.png" alt="Official OpenCode toolbar with app icon dropdown, session tools, and more menu." width="260"> | <img src="./docs/assets/ui-differences/toolbar-after.png" alt="Current Opencodex toolbar with session tools grouped closer to the active session and project access as a folder dropdown." width="240"> |

### Project tree and session menu

<img src="./docs/assets/ui-differences/session-menu-after.png" alt="Current Opencodex project tree with a nested session row and row-level more menu." width="300">

Key differences:

- **Project tree instead of project rail first** — expanded desktop sidebar shows projects with sessions nested underneath.
- **Project block headers** — project rows use a bordered block with chevron, folder glyph, editable project name, and hover new-session action.
- **Fixed open-project action** — the open-project button sits below the scrollable project tree instead of being buried at the end of the list.
- **Session row actions** — nested sessions expose row-level actions through the `...` menu.
- **Codex-style density** — sidebar colors, borders, inline rename fields, and markdown rhythm are tuned for a calmer Codex-like workspace.

### Visual & theme

- **Codex theme** — selectable in settings (`codex` light / dark).
- **Typography & Markdown** — tuned font sizes and line heights for long sessions.

### Hierarchy sidebar

When the sidebar is expanded, projects and sessions appear in a **tree** (project → sessions), similar to Cursor’s left panel:

| Feature | Description |
|---------|-------------|
| Collapse | Chevron toggles sessions under each project |
| Project icons | Line-style folder glyphs; **Shift + click** cycles three styles (`folder` / `file-tree` / `folder-add-left`), persisted locally |
| Selection | Current project uses a **thin outline**, not a heavy fill |
| New session | Button on project row (on hover) |
| Session menu | **⋯** on session rows (rename, share, archive, delete, …) |
| Open project | Centered control between the project list and bottom toolbar |

### Session & titlebar

- **Session toolbar** (Review, Terminal, file tree, …) lives on the **session title row**; the window titlebar keeps only light actions (e.g. open in external app).
- Inline rename fields use inset borders instead of strong focus rings.

### Desktop window

- **Maximize** on first launch or when restored size is too small.
- Minimum size **1024 × 640**.
- Dev server pins Vite to port **5173** (`strictPort`) to avoid stale dynamic imports.

## Upstream

- Upstream: [anomalyco/opencode](https://github.com/anomalyco/opencode)
- This fork tracks `dev` and layers desktop UX commits on top.
- CLI, server, and plugin stack remain largely unchanged from opencode.

## Development

**Requirements:** [Bun](https://bun.sh) 1.3+, Windows / macOS / Linux (desktop tested mainly on Windows).

```bash
bun install
bun dev:desktop    # Electron app
bun dev            # opencode server / CLI
```

The desktop `predev` step builds the embedded opencode node bundle and copies icons (can take ~30–60s on first run).

## Releases

Prebuilt installers: [GitHub Releases](https://github.com/The-R0/Opencodex/releases).

### Build locally (Windows)

```powershell
$env:OPENCODE_CHANNEL = "opencodex"
bun install
bun run --cwd packages/desktop build
bun run --cwd packages/desktop package:win
```

Output: `packages/desktop/dist/`.

### Publish a GitHub Release

```bash
git tag v0.1.0
git push origin v0.1.0
```

Pushing a `v*` tag runs [.github/workflows/release-opencodex.yml](.github/workflows/release-opencodex.yml) to build the Windows installer and attach it to the release.

## Troubleshooting

**`Failed to fetch dynamically imported module` (e.g. ghostty-web)**

- Kill anything on port **5173**, delete `packages/desktop/node_modules/.vite`, restart `bun dev:desktop`, then reload the app.

**Small window / broken scaling**

- Remove window state: `%APPDATA%\ai.opencode.desktop\window-state.json` (same as official desktop).

## Status

Experimental personal fork; expect fast iteration. Feedback welcome via [Issues](https://github.com/The-R0/Opencodex/issues).

## License

MIT, same as opencode — see [LICENSE](./LICENSE).
