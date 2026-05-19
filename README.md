# Opencodex

<p align="center">
  <strong>English</strong> · <a href="README.zh.md">简体中文</a>
</p>

Opencodex is still essentially [opencode](https://github.com/anomalyco/opencode), with the desktop UI reorganized for clarity. You can still use free models, and your existing API settings, model configuration, and overall workflow stay the same.

Desktop release: [v0.1.0](https://github.com/The-R0/opencode-X/releases/tag/v0.1.0)

## UI differences from official OpenCode

### Main UI

<img src="./assets/readme/main-ui.jpg" alt="Current Opencodex main desktop UI." width="760">

### Sidebar recognition

<img src="./assets/readme/sidebar-before.png" alt="Official OpenCode sidebar with a vertical project avatar rail and the selected project panel." width="260">

In the original layout, it is hard to tell what the different C and K letters are supposed to mean at a glance.

<img src="./assets/readme/sidebar-after.png" alt="Current Opencodex sidebar with search, project tree, fixed open-project action, and bottom tools." width="320">

Opencodex turns that area into a proper project tree: projects read like blocks, sessions live under the project they belong to, and the open-project action stays fixed below the scroll area.

### Toolbar comparison

| Official OpenCode | Current Opencodex |
|-------------------|-------------------|
| <img src="./assets/readme/toolbar-before.png" alt="Official OpenCode toolbar with app icon dropdown, session tools, and more menu." width="260"> | <img src="./assets/readme/toolbar-after.png" alt="Current Opencodex toolbar with session tools grouped closer to the active session and project access as a folder dropdown." width="240"> |

The toolbar is simplified so project access and session actions feel less scattered.

### Session actions

<img src="./assets/readme/屏幕截图 2026-05-19 094658.jpg" alt="Official OpenCode session menu floating in the top-right area with rename and delete actions." width="180">

Putting rename and delete for a session in the top-right corner of the session box is awkward. Those actions belong beside the session they act on, not detached from it.

<img src="./assets/readme/session-menu-after.jpg" alt="Current Opencodex project tree with a nested session row and row-level more menu." width="300">

Opencodex moves that menu to the right side of the session row in the left sidebar, so path-related actions feel tied to the correct item instead of floating elsewhere in the page.

### Plan placement

| Official OpenCode | Current Opencodex |
|-------------------|-------------------|
| <img src="./assets/readme/屏幕截图 2026-05-19 095838.jpg" alt="Official OpenCode plan block taking over the center input area." width="420"> | <img src="./assets/readme/屏幕截图 2026-05-19 103109.jpg" alt="Current Opencodex progress panel moved to a smaller area on the right side." width="320"> |

The old centered PLAN block is visually loud and gets in the way of the main conversation. Opencodex moves progress into a quieter right-side area so the chat stays primary.

### Message styling

<img src="./assets/readme/message-style.jpg" alt="Current Opencodex conversation area with clearer user and model styling." width="620">

User and model turns are easier to scan because the conversation now carries clearer visual markers instead of feeling like one flat block of text.

### Code and path tone

<img src="./assets/readme/code-tone.jpg" alt="Current Opencodex code and path styling using a softer gray tone." width="420">

File paths and inline code no longer jump out in green. They use a softer gray emphasis so the page reads more evenly without losing structure.

### Main changes

- Project rail becomes a project tree with nested sessions.
- Project headers become clearer blocks with chevron, folder glyph, and inline rename.
- Open project stays outside the scroll list instead of getting buried.
- Session actions live next to the session row instead of farther away in the top area.
- Progress no longer sits in the middle of the composer area.
- User and model turns have clearer visual markers.
- File paths and inline code shift from green emphasis to a softer gray shadowed tone.
- Overall spacing, borders, and reading density move closer to a calmer Codex-like workspace.

## Upstream

- Upstream: [anomalyco/opencode](https://github.com/anomalyco/opencode)
- This fork tracks `dev` and layers desktop UX commits on top.
- CLI, server, and plugin stack remain largely unchanged from opencode.

## Status

Experimental personal fork; expect fast iteration. Feedback welcome via [Issues](https://github.com/The-R0/Opencodex/issues).

## License

MIT, same as opencode; see [LICENSE](./LICENSE).
