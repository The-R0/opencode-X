# OpenCodex

<p align="center">
  <strong>English</strong> · <a href="README.zh.md">简体中文</a>
</p>

OpenCodex is an unofficial fork of [opencode](https://github.com/anomalyco/opencode) focused on **desktop (Electron)** UX experiments.

It keeps opencode’s core capabilities while exploring a Codex / Cursor–style interface: hierarchical sidebar, subtle selection states, unified folder icons, and a dedicated Codex visual theme for users juggling many local projects.

> OpenCodex is not affiliated with the OpenCode team and does not represent upstream product direction.

## Highlights

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

- Remove window state: `%APPDATA%\ai.opencode.desktop.opencodex\window-state.json` (release build) or `%APPDATA%\ai.opencode.desktop.dev\window-state.json` (dev build).

## Status

Experimental personal fork; expect fast iteration. Feedback welcome via [Issues](https://github.com/The-R0/Opencodex/issues).

## License

MIT, same as opencode — see [LICENSE](./LICENSE).
