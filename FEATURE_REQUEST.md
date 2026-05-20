# Proposed Feature Request: Desktop UI/UX Enhancements for Clarity and Workspace Efficiency

This document contains a structured draft for a Feature Request issue that can be submitted upstream to the official [anomalyco/opencode](https://github.com/anomalyco/opencode) repository. It compiles the UX improvements implemented in [Opencodex](https://github.com/The-R0/opencode-X) into a clear, actionable proposal for the official maintainers.

***

## GitHub Issue Draft

**Title:** `[FEATURE] Desktop UI/UX Enhancements for Workspace Clarity, Context, and Focus`

### Describe the enhancement you want to request

The current desktop UI of OpenCode has several scattered layout elements and high-contrast visuals that can introduce cognitive load during extended coding sessions. 

We propose a set of integrated UI/UX improvements—already experimented with and validated in the community fork **Opencodex**—to streamline project navigation, declutter the workspace, improve action context, and reduce visual noise.

---

### Detailed Proposal: Key UX Refinements

#### 1. Sidebar Project Navigation (Rail $\rightarrow$ Nested Project Tree)
*   **Current Issue:** The official sidebar relies on vertical icon rails (using single letters like 'C', 'K') which are difficult to distinguish at a glance. Sessions are separated from their parent projects in different panels.
*   **Proposed Enhancement:** Transition the sidebar into a unified **Project Tree** where:
    *   Projects display as collapsible list blocks with chevrons, folder glyphs, and inline renaming.
    *   Sessions are nested directly under their parent projects.
    *   The "Open Project" button remains pinned/fixed at the bottom of the sidebar, ensuring it is never buried under long lists.

| Official OpenCode Sidebar | Proposed Opencodex Sidebar |
| :---: | :---: |
| ![Official Sidebar](assets/readme/sidebar-before.png) | ![Proposed Sidebar](assets/readme/sidebar-after.png) |

*   **Benefits:** Clearer hierarchical relationship between projects and sessions; easier navigation across multiple active projects.

---

#### 2. Localized Session Actions
*   **Current Issue:** Actions like *Rename*, *Share*, *Archive*, and *Delete* for individual sessions are located in the top-right corner of the main conversation area, detached from the session list context.
*   **Proposed Enhancement:** Move session-specific actions to a row-level context menu (ellipsis menu) located on the right side of the active/hovered session row in the left sidebar.

| Official Session Menu Placement | Proposed Row-Level Menu |
| :---: | :---: |
| ![Official Session Menu](assets/readme/%E5%B9%95%E6%88%AA%E5%9B%BE%202026-05-19%20094658.jpg) | ![Proposed Session Menu](assets/readme/session-menu-after.jpg) |

*   **Benefits:** Matches the standard UX principle: *"Keep action entry points next to the target objects they modify."*

---

#### 3. Simplified Toolbar
*   **Current Issue:** Project access entry points and session action items are scattered across the top toolbar, causing visual clutter.
*   **Proposed Enhancement:** Group session actions directly next to the active session identifier, and consolidate project-level settings/access into a dropdown folder menu.

| Official OpenCode Toolbar | Proposed Opencodex Toolbar |
| :---: | :---: |
| ![Official Toolbar](assets/readme/toolbar-before.png) | ![Proposed Toolbar](assets/readme/toolbar-after.png) |

*   **Benefits:** Reduces toolbar sprawl and reserves the top bar for global controls.

---

#### 4. Relocating the Plan/Progress Panel
*   **Current Issue:** The active `PLAN` progress block occupies a large, centered block directly above the input composer, interrupting the vertical flow of the main chat.
*   **Proposed Enhancement:** Relocate the planning and generation progress log to a dedicated, collapsible side panel on the right side of the workspace.

| Official OpenCode Center PLAN Block | Proposed Right-Side Panel |
| :---: | :---: |
| ![Official PLAN Block](assets/readme/%E5%B9%95%E6%88%AA%E5%9B%BE%202026-05-19%20095838.jpg) | ![Proposed Right Panel](assets/readme/%E5%B9%95%E6%88%AA%E5%9B%BE%202026-05-19%20103109.jpg) |

*   **Benefits:** Allows the main chat area to remain primary, uncluttered, and readable, while still offering visibility of background tasks without interrupting input focus.

---

#### 5. Softened Visual Theme for Code & Inline Paths
*   **Current Issue:** File paths and inline code blocks use highly saturated green highlights that distract from regular text reading flow.
*   **Proposed Enhancement:** Soften the emphasis color of inline code tags and file paths to a muted gray background with subtle shadowing.

| Proposed Softer Code / Path Style |
| :---: |
| ![Proposed Code Styling](assets/readme/code-tone.jpg) |

*   **Benefits:** Creates a more balanced reading density, closer to professional IDE/Code editor aesthetics, making the screen comfortable to look at during long development sessions.

---

#### 6. Enhanced Message & Conversational Bubble Styling
*   **Current Issue:** User and model messages feel like a continuous, flat block of text with weak visual differentiation.
*   **Proposed Enhancement:** Introduce distinct style separation (e.g. subtle background differences, clearer avatar alignment, and distinct borders) between the user prompt and agent response blocks.

| Proposed Message Turn Styling |
| :---: |
| ![Proposed Message Styling](assets/readme/message-style.jpg) |

*   **Benefits:** Improves scannability of historical context.

---

### Implementation & Reference
Many of these layout and styling improvements have already been successfully prototyped in the [Opencodex (The-R0/opencode-X)](https://github.com/The-R0/opencode-X) repository. These changes have been layered on top of the `dev` branch with minimal impact on the CLI, server, or plugin stack, proving that these desktop UX refinements can be integrated smoothly.
