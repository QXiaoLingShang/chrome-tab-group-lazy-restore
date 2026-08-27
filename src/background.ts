/** Service-worker entry point that wires Chrome Tab events to Group logic. */
import {
  detectGroup,
  getBatch,
  getBatchByTab,
  scheduleInspection,
  trackNewTab
} from "./group.js";
import {
  notifyTitleUpdated
} from "./discard.js";
import type { Tab } from "./types.js";

chrome.tabs.onCreated.addListener(trackNewTab);

/** Handle Group, title, and URL updates for tracked restore batches. */
function handleTabUpdated(
  _tabId: number,
  changeInfo: { groupId?: number; title?: string; url?: string },
  tab: Tab
): void {
  if (changeInfo.groupId !== undefined) {
    detectGroup(tab);
  }

  const batch = getBatch(tab.windowId, tab.groupId ?? -1);

  // fix: Wake the queue only when Chrome reports a title change and the batch enables title waiting.
  if (
    changeInfo.title !== undefined &&
    tab.id !== undefined &&
    batch?.waitForTitleBeforeDiscard
  ) {
    notifyTitleUpdated(tab.id, batch);
  }

  if (
    changeInfo.groupId === undefined &&
    changeInfo.url === undefined
  ) {
    return;
  }

  if (batch) {
    scheduleInspection(batch);
  }
}

chrome.tabs.onUpdated.addListener(handleTabUpdated);

/** Protect the active Tab when Chrome reports an activation. */
function handleTabActivated({ tabId, windowId }: { tabId: number; windowId: number }): void {
  const batch = getBatchByTab(windowId, tabId);
  if (!batch) {
    return;
  }

  if (batch.protectedTabId === null) {
    batch.protectedTabId = tabId;
  }
  scheduleInspection(batch);
}

chrome.tabs.onActivated.addListener(handleTabActivated);
