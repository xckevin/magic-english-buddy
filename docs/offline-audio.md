# 可选离线音频

## 使用方式

打开 **设置 → 离线音频（可选）**，选择某一级、词典发音包或“下载全部音频”。应用安装和更新不会自动下载课程 MP3；未下载的内容可以联网播放，已下载内容优先从本机播放。

iPhone / iPad 建议先添加到主屏幕，再从主屏幕打开、学习和下载音频。Safari 与主屏幕版分别保存学习记录和音频，不会自动互通；原有记录仍可在 Safari 中查看，也可通过设置中的学习备份手动迁移。[WebKit 对存储隔离的说明](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)

- 1,721 个唯一 MP3，共 **25,329,964 bytes（约 25.3 MB）**。
- 覆盖全部 90 篇课文、76 个英文听题、课文原词和全部内置词典发音。
- 下载显示进度，可暂停或在失败后继续。重新打开后只下载缺失文件。
- 下载未解锁级别不会改变学习顺序或解锁进度。
- 删除某个包会保留其他已选择的包仍需要的共用片段。“删除全部音频”也会清理旧版音频缓存。
- 删除音频不影响学习记录。设置中的“清除所有数据”会同时清除学习记录和已下载音频。

| 音频包 | 课程数 | 文件数 |  包大小 |
| ------ | -----: | -----: | ------: |
| L1     |     20 |    295 | 3.64 MB |
| L2     |     11 |    217 | 2.64 MB |
| L3     |     15 |    386 | 5.08 MB |
| L4     |     13 |    418 | 5.80 MB |
| L5     |     13 |    475 | 6.38 MB |
| L6     |     10 |    342 | 4.66 MB |
| L7     |      8 |    275 | 3.84 MB |
| 词典   |      — |  1,074 | 11.00 MB |

不同包之间共用单词音频，因此各包大小相加大于全部下载的实际大小。词典归一化后为 1,074 个可播放词条，其中 356 个为本轮补齐的课程词，发音复用已有文件。

## 生成与校验

使用 [Kokoro 0.9.4](https://github.com/hexgrad/kokoro) 与 [Kokoro-82M v1.0](https://huggingface.co/hexgrad/Kokoro-82M)，音色 `af_heart`，生成速度 `0.85`，24 kHz 单声道、48 kbit/s MP3。开发机生成，应用不下载模型或使用付费 TTS API。模型、音色和文本共同决定文件名；模型许可与校验值见 [音频来源说明](../public/audio/README.md)。

```sh
pnpm audio:prepare       # 默认导出全量课程与词典
pnpm audio:generate      # 需 uv、Python 3.13、ffmpeg；复用已生成资源
pnpm audio:verify        # 需 ffmpeg/ffprobe

# 可单独准备某一级；最终发布完整包时再导出全量并运行生成
node scripts/export-audio-input.mjs 2
```

生成过程逐文件原子保存，可中断续跑；全量资源齐备后才写入完整下载包清单。验证脚本检查每个 MP3 的解码、实际大小、SHA-256、时长、词时间点、所有课程与词典的覆盖，以及下载包和资源清单一致性。时间点来自模型对齐，不使用旧课程数据的手写时间轴。

整句、整段音频也包含每个单词的开始和结束时间，支持连续朗读时逐词高亮。全量共 5,938 个词区间；数据示例、暂停变速修复及 iOS 精度边界见 [逐词高亮验证](word-audio-alignment.md)。

## 缓存设计与边界

### 本轮验证

- `pnpm test:run`：262 项单元测试全部通过。
- 生产构建的 Playwright 回归：22 项通过、1 项跳过（WebKit 假麦克风）；包含备份、答题恢复与生词复习。
- 后续升级恢复专项：Chrome / WebKit 另有 2 项通过，见 [学习功能测试记录](learning-recovery-2026-09.md)。
- `pnpm build` 与类型检查通过；ESLint 为 0 错误、27 条原有警告。
- 全量 MP3 校验通过；PWA 自动预缓存为 43 个条目、约 4.44 MiB，其中没有课程 MP3。
- Chromium 实测全部下载、L7 断网重载播放、失败后只补缺失文件，以及删除后保留学习档案；另进行了 390 px 手机宽度的页面检查。
- Xcode iPhone 17 Pro 模拟器（iOS 26.4.1）实测 Safari 和主屏幕版全量下载、源站不可达时冷启动与播放；Safari 暂停续传、删除音频后保留学习记录通过。禁用系统 TTS 后，4 段下载音频仍经 Web Audio 成功播放。详见 [模拟器报告及截图](iphone-simulator-test-2026-09.md)。

### 实现与使用边界

- `vite.config.ts` 将 `audio/**` 排除在预缓存外，并移除音频自动运行时缓存规则。
- 显式下载使用独立 Cache API 缓存 `magic-english-audio-v1`。每个响应通过类型、大小和 SHA-256 校验后才保存；播放器只读缓存，联网播放不会自动保存。
- Web Locks 避免多个页面同时下载或删除；取消后等待在途写入结束，防止删除后文件重新出现。共享片段按用户选择的包保留引用。
- 页面重新打开或恢复可见时检查实际缓存。当前清单以外的旧音频也计入本机占用，允许一键回收；应用更新后缺失的新文件可继续下载。
- 持久存储只在用户主动下载时申请，浏览器可能拒绝。存储不足、网络中断、缓存被系统清理都会反映为可重试状态；不支持相关浏览器接口时仍可联网播放。

依据：[MDN Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)、[Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)、[存储配额与清理](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)、[Vite PWA 预缓存](https://vite-pwa-org.netlify.app/guide/service-worker-precache)。

自动化验证覆盖 Chromium 的完整断网重载，以及 WebKit 的下载、缓存播放和语音控制。Playwright WebKit 的断网重载曾出现内部错误；本次 Xcode iPhone 模拟器的 Safari 与主屏幕版离线冷启动均通过，但实体 iPhone 尚未测试。生成音频已做技术校验，尚未逐句经英语教师听校，尤其人名、拟声词与拼字读法需要人工试听。
