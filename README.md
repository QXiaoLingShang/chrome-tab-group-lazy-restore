# Tab Group Lazy Restore

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Ever reopened a saved Chrome Tab Group and watched your memory usage explode? You keep dozens of tabs around because you might need them later. While they sit idle, Chrome may keep their resource usage under control, so the group seems harmless—until you close the browser or simply close the group without deleting it.

Restore that group, and Chrome may wake up and load every tab at once. A group with 30–40 tabs can suddenly consume 5–6 GB of memory, even if you only wanted to resume one page.

Closing the tabs solves the memory problem, but defeats the purpose of saving the group. Keeping them all loaded makes every restore expensive. Tab Group Lazy Restore bridges that gap.

## How It Works

When Chrome restores a saved group, Tab Group Lazy Restore watches for the burst of tabs created during the restore and handles them one at a time:

1. Leave the currently active tab loaded.
2. Call `chrome.tabs.discard()` on eligible background tabs, unloading their page contents from memory.
3. Keep the tab entries in the original group. When you switch to one, Chrome loads its page again.

Nothing is deleted, and existing tabs are never scanned. Pinned tabs, tabs playing audio, and tabs still navigating are left untouched.

## Source Structure

```text
better_group/
├── manifest.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── background.ts   # Service worker event entry point
│   ├── group.ts        # Restore-batch tracking and tab inspection
│   ├── discard.ts      # Global serial discard queue
│   └── types.ts        # Shared TypeScript types
└── dist/               # Generated extension files
```

## Installation

1. Download the ZIP package from the [latest release](https://github.com/QXiaoLingShang/chrome-tab-group-lazy-restore/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
