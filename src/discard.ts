/** Contains discard eligibility checks and the serial discard queue. */
import type { GroupBatch, Tab, TabId } from "./types.js";

const DISCARD_GAP_MS = 10;

type DiscardTask = {
  batch: GroupBatch;
  tabId: TabId;
};

const discardQueue: DiscardTask[] = [];
let discardQueueIndex = 0;
let discardRunning = false;

/** Check whether a tab is safe to discard for a restore batch. */
export function isDiscardable(tab: Tab, batch: GroupBatch): boolean {
  return (
    tab.id !== undefined &&
    tab.id !== batch.protectedTabId &&
    tab.windowId === batch.windowId &&
    tab.groupId === batch.groupId &&
    !tab.active &&
    !tab.discarded &&
    Boolean(tab.url) &&
    !tab.pendingUrl &&
    !tab.pinned &&
    !tab.audible
  );
}

/** Add eligible tabs to the batch queue and start draining it. */
export function enqueueDiscard(batch: GroupBatch, tabs: Tab[]): void {
  for (const tab of tabs) {
    if (tab.id === undefined || batch.queuedTabIds.has(tab.id)) {
      continue;
    }

    batch.queuedTabIds.add(tab.id);
    discardQueue.push({ batch, tabId: tab.id });
  }

  void drainDiscardQueue();
}

/** Discard queued tabs one at a time while rechecking their current state. */
async function drainDiscardQueue(): Promise<void> {
  if (discardRunning) {
    return;
  }

  discardRunning = true;

  try {
    while (discardQueueIndex < discardQueue.length) {
      const task = discardQueue[discardQueueIndex++];

      try {
        let tab: Tab | undefined;
        try {
          tab = await chrome.tabs.get(task.tabId);
        } catch {
          // The tab may have been closed before it reached the queue.
        }

        if (tab && isDiscardable(tab, task.batch)) {
          try {
            await chrome.tabs.discard(task.tabId);
          } catch {
            // Chrome can reject a discard when the tab changes state.
          }
        }
      } finally {
        task.batch.queuedTabIds.delete(task.tabId);
      }

      if (discardQueueIndex < discardQueue.length) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, DISCARD_GAP_MS);
        });
      }
    }
  } finally {
    discardRunning = false;

    if (discardQueueIndex === discardQueue.length) {
      discardQueue.length = 0;
      discardQueueIndex = 0;
    } else {
      void drainDiscardQueue();
    }
  }
}
