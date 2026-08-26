/** Tracks recently created tabs and short-lived Group restore batches. */
import { enqueueDiscard, isDiscardable } from "./discard.js";
import type { GroupBatch, RecentTab, Tab, TabId } from "./types.js";

const RESTORE_WINDOW_MS = 5000;
const INSPECTION_DELAY_MS = 300;
const BATCH_TTL_MS = 15000;

const recentTabs = new Map<TabId, RecentTab>();
const batches = new Map<string, GroupBatch>();

/** Find the active restore batch for a window and Group. */
export function getBatch(windowId: number, groupId: number): GroupBatch | undefined {
  return batches.get(`${windowId}:${groupId}`);
}

/** Find the restore batch that owns a tracked tab. */
export function getBatchByTab(windowId: number, tabId: TabId): GroupBatch | undefined {
  for (const batch of batches.values()) {
    if (batch.windowId === windowId && batch.tabIds.has(tabId)) {
      return batch;
    }
  }
  return undefined;
}

/** Remember a newly created tab as a possible restore candidate. */
export function trackNewTab(tab: Tab): void {
  if (tab.id === undefined) {
    return;
  }

  const tabId = tab.id;
  recentTabs.set(tabId, {
    createdAt: Date.now(),
    initialGroupId: tab.groupId ?? -1
  });

  setTimeout(() => {
    const recent = recentTabs.get(tabId);
    if (recent && Date.now() - recent.createdAt >= RESTORE_WINDOW_MS) {
      recentTabs.delete(tabId);
    }
  }, RESTORE_WINDOW_MS + 100);
}

/** Debounce inspection so a restored Group can finish assembling. */
export function scheduleInspection(batch: GroupBatch): void {
  if (batch.inspectTimer !== null) {
    clearTimeout(batch.inspectTimer);
  }

  batch.inspectTimer = setTimeout(() => {
    batch.inspectTimer = null;
    void inspectGroup(batch);
  }, INSPECTION_DELAY_MS);
}

/** Associate a recently created tab with the Group it joined. */
export function detectGroup(tab: Tab): void {
  const tabId = tab.id;
  const groupId = tab.groupId ?? -1;
  const recent = tabId === undefined ? undefined : recentTabs.get(tabId);

  if (
    tabId === undefined ||
    !recent ||
    recent.initialGroupId !== -1 ||
    groupId === -1 ||
    Date.now() - recent.createdAt > RESTORE_WINDOW_MS
  ) {
    return;
  }

  recentTabs.delete(tabId);

  const groupBatchKey = `${tab.windowId}:${groupId}`;
  let batch = batches.get(groupBatchKey);

  if (!batch) {
    batch = createBatch(tab.windowId, groupId, groupBatchKey);
  }

  batch.tabIds.add(tabId);
  scheduleInspection(batch);
}

/** Create and expire a short-lived restore batch. */
function createBatch(
  windowId: number,
  groupId: number,
  groupBatchKey: string
): GroupBatch {
  const batch: GroupBatch = {
    windowId,
    groupId,
    tabIds: new Set<TabId>(),
    protectedTabId: null,
    queuedTabIds: new Set<TabId>(),
    inspectTimer: null
  };

  batches.set(groupBatchKey, batch);
  setTimeout(() => {
    if (batch.inspectTimer !== null) {
      clearTimeout(batch.inspectTimer);
    }
    batches.delete(groupBatchKey);
  }, BATCH_TTL_MS);

  return batch;
}

/** Inspect the Group and queue its safe background tabs for discard. */
async function inspectGroup(batch: GroupBatch): Promise<void> {
  let groupTabs: Tab[];

  try {
    groupTabs = await chrome.tabs.query({
      windowId: batch.windowId,
      groupId: batch.groupId
    });
  } catch {
    return;
  }

  const trackedTabs = groupTabs.filter(
    (tab) => tab.id !== undefined && batch.tabIds.has(tab.id)
  );
  const activeTab = trackedTabs.find((tab) => tab.active);

  if (batch.protectedTabId === null && activeTab?.id !== undefined) {
    batch.protectedTabId = activeTab.id;
  }

  if (batch.tabIds.size < 2 || batch.protectedTabId === null) {
    return;
  }

  enqueueDiscard(batch, trackedTabs.filter((tab) => isDiscardable(tab, batch)));
}
