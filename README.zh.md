# Opencodex

## 主要改动

## 当前 UI 和官方 OpenCode 的差异

### 当前主界面

<img src="./assets/readme/main-ui.jpg" alt="当前 Opencodex 主界面。" width="760">

本仓库是 [opencode](https://github.com/anomalyco/opencode) 的非官方分支，主要改桌面端界面的信息组织方式，而不是去动核心能力。

### 左侧栏先说最根上的问题

<img src="./assets/readme/sidebar-before.png" alt="官方 OpenCode 左侧栏：竖向项目头像列表和当前项目面板。" width="260">

原版看到这里，根本分不出来这几个 C 和 K 的区别是什么。

<img src="./assets/readme/sidebar-after.png" alt="当前 Opencodex 左侧栏：搜索框、项目树、固定打开项目入口和底部工具栏。" width="320">

现在改成项目树以后，项目就是项目，会话就挂在项目下面，路径关系一眼能看懂。

### 顶部工具栏前后对比

| 官方 OpenCode | 当前 Opencodex |
|-------------------|-------------------|
| <img src="./assets/readme/toolbar-before.png" alt="官方 OpenCode 顶部工具栏：应用图标下拉、会话工具和更多菜单。" width="260"> | <img src="./assets/readme/toolbar-after.png" alt="当前 Opencodex 顶部工具栏：会话工具靠近当前会话，项目入口收敛为文件夹下拉。" width="240"> |

顶部工具栏也跟着收敛了一些，不再让项目入口和会话操作散得到处都是。

### 项目树和会话菜单

<img src="./assets/readme/session-menu-after.jpg" alt="当前 Opencodex 项目树：会话嵌套在项目下方，行尾更多菜单可直接操作会话。" width="300">

把这个菜单从原来的右上方移到左侧边栏会话的右侧，路径操作更清晰。

### 用户和模型会话风格符

<img src="./assets/readme/message-style.jpg" alt="当前 Opencodex 会话区：用户和模型消息有更明确的风格符。" width="620">

用户和模型的消息现在更容易一眼分开，不会像以前那样整段内容都挤成一种视觉层级。

### 文件路径和代码的颜色处理

<img src="./assets/readme/code-tone.jpg" alt="当前 Opencodex 文件路径和代码样式：从绿色强调改成更轻的灰色阴影。" width="420">

把原本偏绿色的文件路径和代码强调，改成更轻一点的灰色阴影，阅读时不会总被高饱和颜色打断。

主要差异：

- **从项目头像 rail 变成项目树**：展开后的桌面侧边栏直接显示项目，并把最近会话挂在项目下。
- **项目标题变成项目块**：项目行包含边框、展开箭头、文件夹图标、可编辑项目名，以及 hover 出现的新建会话按钮。
- **打开项目固定在列表外**：打开项目按钮放在滚动项目树下方，不会因为项目太多被滚走。
- **会话行有独立操作入口**：嵌套会话行右侧有 `...` 菜单，可做重命名、分享、归档、删除等操作。
- **用户和模型更容易区分**：会话区加了更明确的风格符。
- **路径和代码不再一片发绿**：文件路径和代码改成更轻的灰色阴影强调。
- **更接近 Codex 的紧凑视觉**：侧边栏颜色、边框、内联重命名输入框和 Markdown 阅读节奏都做了更轻的处理。

## 与上游的关系

- 上游仓库：[anomalyco/opencode](https://github.com/anomalyco/opencode)
- 本 fork 在 `dev` 分支上跟踪上游，并叠加桌面 UX 相关提交；合并冲突时需人工处理。
- 上游已有、本 fork **未改** 的部分：CLI、服务端、插件体系等仍与 opencode 一致。

## 状态

个人向实验分支，迭代较快。欢迎在 [Issues](https://github.com/The-R0/Opencodex/issues) 反馈桌面 UX 问题。

## 许可

基于 opencode，遵循 [MIT License](./LICENSE)。
