# Opencodex

<p align="center">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>

Opencodex 本质上仍然是 [opencode](https://github.com/anomalyco/opencode)，只是把桌面端 UI 重新整理得更清晰。免费模型照样能用，现有的 API 配置、模型配置和整体使用方式也不会改变。

桌面端发布版本：[v0.1.0](https://github.com/The-R0/opencode-X/releases/tag/v0.1.0)

## 当前 UI 和官方 OpenCode 的区别

### 主界面

<img src="./assets/readme/main-ui.jpg" alt="当前 Opencodex 主界面。" width="760">

### 左侧栏识别问题

<img src="./assets/readme/sidebar-before.png" alt="官方 OpenCode 左侧栏：竖向项目头像列表和当前项目面板。" width="260">

原版看到这里，根本分不出来这几个 C 和 K 的区别是什么。

<img src="./assets/readme/sidebar-after.png" alt="当前 Opencodex 左侧栏：搜索框、项目树、固定打开项目入口和底部工具栏。" width="320">

现在改成项目树以后，项目就是项目，会话就挂在项目下面，路径关系一眼能看懂。

### 顶部工具栏前后对比

| 官方 OpenCode | 当前 Opencodex |
|-------------------|-------------------|
| <img src="./assets/readme/toolbar-before.png" alt="官方 OpenCode 顶部工具栏：应用图标下拉、会话工具和更多菜单。" width="260"> | <img src="./assets/readme/toolbar-after.png" alt="当前 Opencodex 顶部工具栏：会话工具靠近当前会话，项目入口收敛为文件夹下拉。" width="240"> |

顶部工具栏也跟着收了一些，不再让项目入口和会话操作散得到处都是。

### 会话操作位置

<img src="./assets/readme/屏幕截图 2026-05-19 094658.jpg" alt="官方 OpenCode 会话菜单：重命名、分享、归档、删除都放在会话框右上角。" width="180">

原本会话的重命名和删除放在会话框的右上角。
<img src="./assets/readme/session-menu-after.jpg" alt="当前 Opencodex 项目树：会话嵌套在项目下方，行尾更多菜单可直接操作会话。" width="300">

现在把这个菜单移到左侧边栏会话行的右侧，路径操作和会话操作都更清晰，也更符合“对哪一项操作，就把入口放在哪一项旁边”。

### PLAN 位置

| 官方 OpenCode | 当前 Opencodex |
|-------------------|-------------------|
| <img src="./assets/readme/屏幕截图 2026-05-19 095838.jpg" alt="官方 OpenCode 的 PLAN 区块直接占在主输入区上方。" width="420"> | <img src="./assets/readme/屏幕截图 2026-05-19 103109.jpg" alt="当前 Opencodex 把进度面板放到右侧较安静的位置。" width="320"> |

原来中间那个 PLAN 真的很碍眼，直接把输入区和主会话的注意力都切走了。现在把进度挪到右侧小面板，主会话终于能保持干净。

### 用户和模型会话风格符

<img src="./assets/readme/message-style.jpg" alt="当前 Opencodex 会话区：用户和模型消息有更明确的风格符。" width="620">

用户和模型的消息现在更容易一眼分开，不会像以前那样整段内容都挤成同一种视觉层级。

### 文件路径和代码的颜色处理

<img src="./assets/readme/code-tone.jpg" alt="当前 Opencodex 文件路径和代码样式：从绿色强调改成更轻的灰色阴影。" width="420">

把原本偏绿色的文件路径和代码强调，改成更轻一点的灰色阴影，阅读时不会总被高饱和颜色打断。

### 主要变化

- 从项目头像 rail 改成项目树，展开后直接显示项目和其下会话。
- 项目标题变成更清晰的项目块，包含展开箭头、文件夹图标和内联重命名。
- 打开项目入口固定在滚动列表外，不会被长项目列表埋掉。
- 会话操作移到会话行尾，不再漂在顶部右上角。
- PLAN / 进度不再堵在主输入区中间。
- 用户和模型的消息有更明确的视觉标记。
- 文件路径和代码从绿色强调改成更轻的灰色阴影。
- 整体边框、间距和阅读密度更接近一个更安静的 Codex 风格工作区。

## 与上游的关系

- 上游仓库：[anomalyco/opencode](https://github.com/anomalyco/opencode)
- 本 fork 跟随 `dev` 分支，并在上面叠加桌面端 UX 调整。
- CLI、服务端和插件体系基本保持和 opencode 一致。

## 状态

个人实验分支，迭代会比较快。欢迎在 [Issues](https://github.com/The-R0/Opencodex/issues) 反馈桌面端 UX 问题。

## 许可

基于 opencode，遵循 [MIT License](./LICENSE)。
