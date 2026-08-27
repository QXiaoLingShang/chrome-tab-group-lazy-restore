<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  English · <a href="README.zh-CN.md">Simplified Chinese</a>
</p>

Ever reopened a saved Chrome Tab Group and watched your memory usage explode? You keep dozens of tabs around because you might need them later. While they sit idle, Chrome may keep their resource usage under control, so the group seems harmless—until you close the browser or simply close the group without deleting it.

Restore that group, and Chrome may wake up and load every tab at once. A group with 30–40 tabs can suddenly consume 5–6 GB of memory, even if you only wanted to resume one page.

Closing the tabs solves the memory problem, but defeats the purpose of saving the group. Keeping them all loaded makes every restore expensive. Tab Group Lazy Restore bridges that gap.

## Installation

1. Download the ZIP package from the [latest release](https://github.com/QXiaoLingShang/chrome-tab-group-lazy-restore/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/` in Chrome and enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.

## Configuration

Open `chrome://extensions/`, click **Details** for the extension, and select **Extension options**.

- **Advanced settings** is collapsed by default. Expand it to tune restore detection, inspection delay, title-wait lifetime, retry behavior, and discard concurrency. These are internal controls; unusual values may increase restore latency or browser pressure.
- **Minimum tabs**: Groups with this many Tabs or fewer are loaded normally. The default is `5`.
- **Group allowlist**: Add titles in the final input row. Press Enter or leave the field to confirm an entry. Groups whose title exactly matches an entry are loaded normally.
- **Wait for tab titles (Experimental)**: When enabled, wait for a title update event before discarding an individual tab. Tabs that never receive the event are discarded when the restore wait deadline expires. Disabled by default. This can prolong the high-memory period while a Group is opening.

Settings are stored locally in Chrome and take effect on the next Group restore. No rebuild is required after changing them.

## How It Works

When Chrome restores a saved group, Tab Group Lazy Restore watches for the burst of tabs created during the restore and handles them one at a time:

1. Leave the currently active tab loaded.
2. Put eligible background tabs into a bounded-concurrency discard queue. When the experimental title option is enabled, each tab waits for its title update event first.
3. Keep the tab entries in the original group. When you switch to one, Chrome loads its page again.

Nothing is deleted, and existing tabs are never scanned. Pinned tabs, tabs playing audio, and tabs still navigating are left untouched.

## Known issues

This is not true lazy loading. When Chrome opens a saved Tab Group, it may still load multiple tabs in parallel, so opening a Group can cause a brief 1–2 second memory spike. The extension cannot prevent Chrome's initial loading; it can only discard eligible tabs as quickly as possible after detecting them. Chrome may also take additional time to reclaim memory and refresh its memory reporting.

## Source Structure

```text
better_group/
├── manifest.json
├── options.html        # Extension settings page
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── background.ts   # Service worker event entry point
│   ├── advanced-config.ts # Internal tuning constants
│   ├── config.ts        # Restore settings and storage loading
│   ├── group.ts        # Restore-batch tracking and tab inspection
│   ├── discard.ts      # Bounded-concurrency discard queue
│   ├── options.ts       # Settings page logic
│   └── types.ts        # Shared TypeScript types
└── dist/               # Generated extension files
```

## License

Unless otherwise noted, the original source code, documentation, and artwork in this repository are licensed under the [MIT License](LICENSE).

You may use, modify, distribute, and sell the Software, provided that the copyright notice and license notice are included. Third-party dependencies and materials retain their own licenses.
