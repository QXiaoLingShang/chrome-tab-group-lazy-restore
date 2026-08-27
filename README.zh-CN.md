<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

想象一下：你在一个 Saved Tab Group 里积累了三四十个标签页。它们平时安静地待在后台，你不舍得关闭，因为每个页面以后可能还会用到。长时间不操作时，Chrome 可能会通过资源管理暂时降低它们的内存占用，因此一切看起来相安无事。直到你关闭浏览器，或者只是暂时关闭这个 Group（并没有删除它）。

下次重新打开这个 Group 时，Chrome 可能会同时唤醒并加载其中的所有标签页。内存瞬间飙到 5～6 GB——而你可能只是想打开其中一个页面。

手动关闭这些标签页确实能释放内存，却也会让这组“以后还要用”的页面消失；保留它们，又要承受恢复时的内存峰值。Tab Group Lazy Restore 正是为了解决这个矛盾。

## 安装

1. 从 [最新 Release](https://github.com/QXiaoLingShang/chrome-tab-group-lazy-restore/releases) 下载 ZIP 安装包。
2. 解压 ZIP 文件。
3. 在 Chrome 中打开 `chrome://extensions/`，启用**开发者模式**。
4. 点击**加载已解压的扩展程序（Load unpacked）**，选择包含 `manifest.json` 的解压文件夹。

## 配置

打开 `chrome://extensions/`，点击扩展的**详细信息**，然后选择**扩展程序选项（Extension options）**。

- **高级配置**默认折叠，展开后可以调整恢复检测、检查延迟、title 等待时限、重试和 discard 并发数等内部参数。通常无需修改，错误的值可能增加恢复延迟或浏览器压力。
- **最小标签页数量**：Tab 数量小于或等于该值的 Group 正常全部加载，默认值为 `5`。
- **Group 白名单**：在最后一行输入标题，按 Enter 或离开输入框后确认。标题完全匹配的 Group 正常全部加载。
- **等待 Tab 标题（实验性）**：开启后，单个 Tab 会等待 title 更新事件后再 discard；如果事件一直没有到达，等待截止后仍会强制 discard。默认关闭。此设置可能延长 Group 打开期间的内存高峰期。

配置会保存在 Chrome 本地，并在下一次恢复 Group 时生效。修改后不需要重新构建扩展。

## 原理

Tab Group Lazy Restore 会在 Group 恢复时识别短时间内创建的同一批 Tab，然后按顺序处理：

1. 保留当前活动页。
2. 将其余符合条件的后台 Tab 放入有限并发的 discard 队列，调用 `chrome.tabs.discard()` 将它们尽快从内存中释放。开启实验性设置后，Tab 会先等待 title 更新事件。
3. 这些 Tab 仍然保留在原来的 Group 中；当你真正切换到某个 Tab 时，Chrome 再恢复它的页面内容。

插件不会删除标签页，也不会扫描已经存在的普通标签页。固定、播放声音或仍在导航中的 Tab 会被跳过。

## 已知问题

这不是真正意义上的懒加载。Chrome 打开 Saved Tab Group 时，仍可能并行加载多个 Tab，因此打开 Group 后通常会有短暂的 1～2 秒内存高峰。插件无法阻止 Chrome 的初始加载，只能在识别出可处理的 Tab 后尽快调用 discard 来降低内存占用；Chrome 回收内存和刷新统计也可能存在额外延迟。

## 源码结构

```text
better_group/
├── manifest.json
├── options.html        # 扩展设置页面
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── background.ts   # Chrome Tab 事件入口
│   ├── advanced-config.ts # 内部高级调参常量
│   ├── config.ts        # 恢复设置和存储读取
│   ├── group.ts        # Group 恢复批次和 Tab 检查
│   ├── discard.ts      # 有限并发 discard 队列
│   ├── options.ts       # 设置页面逻辑
│   └── types.ts        # 共享类型
└── dist/               # 构建生成的扩展脚本
```

## 许可证

除非另有说明，本仓库中的原创源码、文档和图像素材均采用 [MIT License](LICENSE) 许可证。

你可以使用、修改、分发和销售本软件，但必须保留版权声明和许可证声明。第三方依赖和第三方素材仍受其各自许可证约束。
