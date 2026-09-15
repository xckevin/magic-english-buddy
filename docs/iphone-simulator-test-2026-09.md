# iPhone 模拟器实测（2026-09-15）

## 环境与方法

- Xcode iPhone 17 Pro 模拟器，iOS **26.4.1（23E254a）**；独立设备 `Magic Buddy Test iPhone`。
- 测试生产构建，地址 `http://localhost:4174/magic-english-buddy/`。
- 通过 Simulator 操作 Safari 和添加到主屏幕后的独立 Web App；不是桌面浏览器的手机尺寸模拟。
- 离线测试关闭本地预览服务器，并用 `curl` 确认连接失败。整个应用源站均不可达，但没有关闭宿主机网络，也不等同于真机飞行模式。
- Safari Web Inspector 连接上述模拟器，确认安全上下文、已激活的 Service Worker 和实际 Cache API 内容。

## 测试结果

| 场景 | 实测结果 |
| --- | --- |
| 首次打开 | 引导、创建档案和设置可用；音频初始为 0 / 1,721，无自动下载 |
| 全量下载 | Safari 下载 1,721 / 1,721 个音频，25.3 MB |
| 暂停与续传 | 暂停在 1,406 个；刷新后保留进度，继续下载至全量完成 |
| 源站不可达时刷新 | Safari 能重新加载应用，打开地图、阅读页和设置 |
| 源站不可达时冷启动 | 终止 Safari 后重新启动，课程、档案与音频仍可用 |
| 故事朗读 | 离线播放《The Magic Apple》，逐词高亮、跨段播放、暂停与继续正常 |
| 排除系统朗读兜底 | 临时令 `speechSynthesis.speak` 抛错；《A Little Cat》4 段均通过 Web Audio 启动，解码数据非零，系统 TTS 调用数为 0 |
| 查词与跟读 | apple 查词卡片、单词播放、保存生词、第一段示范播放和段落切换可用 |
| 离线练习 | 听题进入播放状态；完成第一课 3 题，获得 100 分并保存 19 点魔力、1 篇阅读记录、解锁第二课 |
| 删除音频 | 离线删除全部音频后占用归零；19 点魔力、1 篇阅读记录和连续学习记录保留 |
| 主屏幕安装 | Safari 的“…”→分享→展开更多→添加到主屏幕可用 |
| 主屏幕下载与冷启动 | 独立应用下载 1,721 个音频；源站关闭并终止 Web App 后，从主屏幕可重新打开课程 |
| 主屏幕离线播放 | 源站关闭后，朗读推进到第二段并高亮单词，暂停正常 |
| 长句变速与暂停恢复 | 主屏幕版离线播放 L7《The Genesis Guardian》；1.2 倍速暂停在 `since`，改为 0.8 倍速后高亮保持原位，恢复后推进到 `before` 并进入第二段 |

Web Audio 的逐段时长、采样率、峰值和运行状态记录在 [诊断证据](iphone-simulator-evidence/audio-probe.json)。诊断代码仅临时用于模拟器页面，页面重载后消失，没有加入产品代码。原始文件为 24 kHz，AudioContext 解码时重采样为设备的 48 kHz。

## 发现与修正

### 1. 主屏幕阅读页标题被灵动岛遮挡

小屏媒体查询把阅读页 header 的 padding 重设为 `12px 16px`，覆盖了原有顶部安全区。Safari 浏览器工具栏环境没有暴露这个问题，独立应用中标题与状态栏、灵动岛重叠。

修正：小屏布局保留 `--safe-area-top`，让返回按钮、课程信息和标题位于安全区内。重新生产构建、更新主屏幕应用后，模拟器复测确认遮挡已消失，离线播放正常。

### 2. Safari 与主屏幕版的数据隔离没有说明

在 Safari 完成一课后安装主屏幕版，后者仍进入首次引导。原档案仍在 Safari 中，并未被删除。WebKit 官方说明：添加主屏幕应用会复制 cookies，其他本地存储不会复制，之后两者也不共享网站数据。[WebKit 官方说明](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)

修正：在 iOS 浏览器的下载区域、安装步骤中说明两者分别保存学习记录和音频，建议先安装，再从主屏幕开始学习、下载。主屏幕版不显示这条安装提示。后续已补充 JSON 备份，可手动迁移学习记录，音频仍需单独下载，见 [学习功能补齐](learning-recovery-2026-09.md)。

同时更新了 iOS 26 可先通过“…”进入分享的步骤，将安装介绍的“完全离线可用”改为“下载音频后可离线听读”。

### 3. 暂停恢复与变速后的高亮漂移

自动化测试复现了异步暂停恢复时重新设置播放时间基准会丢失已播放时间，变速后高亮落后。修正为沿用 AudioContext 的暂停时钟，并在变速时保留已播放位置。专用模拟器临时解锁 L7 测试节点，离线实测长句的快慢速、暂停恢复及跨段高亮通过。

全量词时间区间和阅读单词顺序校验通过。另对 4 段 MP3 做模拟器解码波形比对，发现相对 FFmpeg 无填充参考的固定 24 ms 偏移；没有据此加入跨浏览器统一补偿。详见 [逐词高亮验证与精度边界](word-audio-alignment.md)。

## 证据

- [Safari 全量下载](iphone-simulator-evidence/01-all-audio-downloaded.png)
- [离线朗读暂停](iphone-simulator-evidence/02-offline-reader-paused.png)
- [删除后音频归零](iphone-simulator-evidence/03-audio-deleted.png)
- [学习记录保留](iphone-simulator-evidence/04-learning-preserved.png)
- [主屏幕版全量下载](iphone-simulator-evidence/05-standalone-download.png)
- [安全区修复前](iphone-simulator-evidence/06-reader-before-safe-area.png)
- [安全区修复后](iphone-simulator-evidence/07-reader-safe-area-fixed.png)
- [修复后主屏幕版离线播放](iphone-simulator-evidence/08-standalone-offline-playback.png)
- [Safari 中的数据隔离提示](iphone-simulator-evidence/09-ios-storage-guidance.png)
- [长句暂停后切换速度](iphone-simulator-evidence/10-long-sentence-paused-rate-change.png)
- [恢复后跨段高亮](iphone-simulator-evidence/11-long-story-resumed-next-paragraph.png)
- [iOS MP3 解码波形比对](iphone-simulator-evidence/mp3-waveform-comparison.json)

## 修正后回归

- `pnpm build`：通过，含 TypeScript 检查。
- `pnpm test:run`：228 项通过；全量 1,721 个 MP3 的 `pnpm audio:verify` 校验通过。
- `pnpm exec playwright test --grep 'bundled narration|all audio is opt-in'`：Chrome / WebKit 共 3 项通过，覆盖下载、真实音频解码、暂停、跟读以及 Chromium 全量离线重载。
- `pnpm lint`：0 错误、27 条原有警告。
- 模拟器重新加载新版本，确认主屏幕阅读页避开灵动岛、离线朗读可暂停；Safari 中显示新增数据隔离提示。

## 范围

后续新增功能的模拟器实测：主屏幕版保留 1,721 个已下载音频；从设置导出 JSON，经 iOS「Open in… → Save to Files」保存，再通过文件选择器导入并确认恢复。第一题答对后终止 `com.apple.webapp`，从主屏幕重新打开课程练习，恢复第一题反馈并继续到第二题。截图与最新自动化结果见 [学习功能补齐](learning-recovery-2026-09.md)。

这轮验证针对模拟器 Safari 和独立 Web App 的下载、缓存、解码、播放控制及离线页面。没有覆盖实体 iPhone、麦克风录音质量、耳机切换、长时间锁屏、系统空间压力回收或全部课程逐句听校。
