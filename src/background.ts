/** Service-worker entry point that wires Chrome tab events to the Group logic. */
import {
  detectGroup,
  getBatch,
  getBatchByTab,
  scheduleInspection,
  trackNewTab
} from "./group.js";
import type { Tab } from "./types.js";

chrome.tabs.onCreated.addListener(trackNewTab);

/** Handle Group and URL updates for tracked restore batches. */
function handleTabUpdated(
  _tabId: number,
  changeInfo: { groupId?: number; url?: string },
  tab: Tab
): void {
  if (changeInfo.groupId !== undefined) {
    detectGroup(tab);
  }

  if (changeInfo.groupId === undefined && changeInfo.url === undefined) {
    return;
  }

  const batch = getBatch(tab.windowId, tab.groupId ?? -1);
  if (batch) {
    scheduleInspection(batch);
  }
}

chrome.tabs.onUpdated.addListener(handleTabUpdated);

/** Protect a tracked tab when Chrome reports an activation. */
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
