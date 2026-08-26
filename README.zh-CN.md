# Tab Group Lazy Restore

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

想象一下：你在一个 Saved Tab Group 里积累了三四十个标签页。它们平时安静地待在后台，你不舍得关闭，因为每个页面以后可能还会用到。长时间不操作时，Chrome 可能会通过资源管理暂时降低它们的内存占用，因此一切看起来相安无事。直到你关闭浏览器，或者只是暂时关闭这个 Group（并没有删除它）。

下次重新打开这个 Group 时，Chrome 可能会同时唤醒并加载其中的所有标签页。内存瞬间飙到 5～6 GB——而你可能只是想打开其中一个页面。

手动关闭这些标签页确实能释放内存，却也会让这组“以后还要用”的页面消失；保留它们，又要承受恢复时的内存峰值。Tab Group Lazy Restore 正是为了解决这个矛盾。

## 原理

Tab Group Lazy Restore 会在 Group 恢复时识别短时间内创建的同一批 Tab，然后按顺序处理：

1. 保留当前活动页。
2. 对其余符合条件的后台 Tab 依次调用 `chrome.tabs.discard()`，将它们暂时从内存中释放。
3. 这些 Tab 仍然保留在原来的 Group 中；当你真正切换到某个 Tab 时，Chrome 再恢复它的页面内容。

插件不会删除标签页，也不会扫描已经存在的普通标签页。固定、播放声音或仍在导航中的 Tab 会被跳过。

## 源码结构

```text
better_group/
├── manifest.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── background.ts   # Chrome Tab 事件入口
│   ├── group.ts        # Group 恢复批次和 Tab 检查
│   ├── discard.ts      # 全局串行 discard 队列
│   └── types.ts        # 共享类型
└── dist/               # 构建生成的扩展脚本
```
