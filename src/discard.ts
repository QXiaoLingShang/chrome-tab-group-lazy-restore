/** Discard eligibility checks and bounded discard/retry queues. */
import { getAdvancedConfig } from "./advanced-config.js";
import type { GroupBatch, Tab, TabId, Timer } from "./types.js";

type RetryReason = "title" | "discard";

type DiscardTask = {
  batch: GroupBatch;
  tabId: TabId;
  discardRetries: number;
  titleObserved: boolean;
  retryReason?: RetryReason;
  retryTimer?: Timer;
};

const discardQueue: DiscardTask[] = [];
const pendingTasks = new Map<TabId, DiscardTask>();
let activeDiscardCount = 0;

/** Check whether a Tab is safe to discard for a restore batch. */
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

/** Add eligible Tabs to the ready queue and start draining it. */
export function enqueueDiscard(batch: GroupBatch, tabs: Tab[]): void {
  for (const tab of tabs) {
    if (tab.id === undefined || pendingTasks.has(tab.id)) {
      continue;
    }

    const task: DiscardTask = {
      batch,
      tabId: tab.id,
      discardRetries: 0,
      titleObserved:
        !batch.waitForTitleBeforeDiscard || batch.titleUpdatedTabIds.delete(tab.id)
    };
    pendingTasks.set(tab.id, task);
    discardQueue.push(task);
  }

  void drainDiscardQueue();
}

/** Wake a Tab that is waiting for its title. */
export function notifyTitleUpdated(tabId: TabId, batch: GroupBatch): void {
  const task = pendingTasks.get(tabId);
  // fix: A title event may arrive before inspection enqueues the task; remember it to avoid indefinite waiting.
  if (!task || !task.batch.waitForTitleBeforeDiscard) {
    batch.titleUpdatedTabIds.add(tabId);
    return;
  }

  // A title event only wakes a waiting task; repeated title events do not create duplicate tasks.
  const wasTitleRetrying = task.retryReason === "title";
  task.titleObserved = true;
  if (wasTitleRetrying) {
    // fix: Cancel the wait timer and requeue immediately when the title arrives.
    if (task.retryTimer !== undefined) {
      clearTimeout(task.retryTimer);
    }
    task.retryReason = undefined;
    task.retryTimer = undefined;
    discardQueue.push(task);
  }
  void drainDiscardQueue();
}

function finishTask(task: DiscardTask): void {
  if (task.retryTimer !== undefined) {
    clearTimeout(task.retryTimer);
    task.retryTimer = undefined;
  }
  task.retryReason = undefined;
  pendingTasks.delete(task.tabId);
}

/** Retry title checks or transient discard failures without blocking other Tabs. */
function retryTask(task: DiscardTask, reason: RetryReason): void {
  if (
    reason === "discard" &&
    ++task.discardRetries > getAdvancedConfig().maxDiscardRetries
  ) {
    finishTask(task);
    return;
  }

  const delay = Math.max(
    0,
    Math.min(getAdvancedConfig().retryDelayMs, task.batch.deadline - Date.now())
  );
  task.retryReason = reason;
  task.retryTimer = setTimeout(() => {
    task.retryReason = undefined;
    task.retryTimer = undefined;
    discardQueue.push(task);
    void drainDiscardQueue();
  }, delay);
}

/** Start a bounded number of discard workers to avoid unbounded concurrency. */
function drainDiscardQueue(): void {
  while (
    activeDiscardCount < getAdvancedConfig().maxConcurrentDiscards &&
    discardQueue.length > 0
  ) {
    const task = discardQueue.shift();
    if (!task) {
      continue;
    }

    activeDiscardCount += 1;
    void processDiscardTask(task).finally(() => {
      activeDiscardCount -= 1;
      if (discardQueue.length > 0) {
        setTimeout(drainDiscardQueue, getAdvancedConfig().discardGapMs);
      }
    });
  }
}

async function processDiscardTask(task: DiscardTask): Promise<void> {
  let tab: Tab | undefined;
  try {
    tab = await chrome.tabs.get(task.tabId);
  } catch {
    // The Tab may have been closed before it reached the queue; treat it as missing.
  }

  if (!tab || !isDiscardable(tab, task.batch)) {
    finishTask(task);
  } else if (
    task.batch.waitForTitleBeforeDiscard &&
    !task.titleObserved &&
    Date.now() < task.batch.deadline
  ) {
    // fix: Wait for the title only until the batch deadline, then force discard.
    retryTask(task, "title");
  } else {
    try {
      await chrome.tabs.discard(task.tabId);
      finishTask(task);
    } catch {
      retryTask(task, "discard");
    }
  }
}
