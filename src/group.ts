/** Track recently created Tabs and short-lived Group restore batches. */
import { loadRestoreConfig } from "./config.js";
import { enqueueDiscard, isDiscardable } from "./discard.js";
import { getAdvancedConfig } from "./advanced-config.js";
import type { GroupBatch, RecentTab, Tab, TabId } from "./types.js";

const recentTabs = new Map<TabId, RecentTab>();
const batches = new Map<string, GroupBatch>();

// Load persisted tuning values early so the first restore event does not use defaults.
void loadRestoreConfig();

/** Find the active restore batch for a window and Group. */
export function getBatch(windowId: number, groupId: number): GroupBatch | undefined {
  return batches.get(`${windowId}:${groupId}`);
}

/** Find the restore batch that owns a tracked Tab. */
export function getBatchByTab(windowId: number, tabId: TabId): GroupBatch | undefined {
  for (const batch of batches.values()) {
    if (batch.windowId === windowId && batch.tabIds.has(tabId)) {
      return batch;
    }
  }
  return undefined;
}

/** Remember a newly created Tab as a possible restore candidate. */
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
    if (recent && Date.now() - recent.createdAt >= getAdvancedConfig().restoreWindowMs) {
      recentTabs.delete(tabId);
    }
  },
    getAdvancedConfig().restoreWindowMs +
      getAdvancedConfig().recentTabCleanupPaddingMs
  );
}

/** Debounce inspection so a restoring Group can finish assembling. */
export function scheduleInspection(batch: GroupBatch): void {
  if (batch.inspectTimer !== null) {
    clearTimeout(batch.inspectTimer);
  }

  batch.inspectTimer = setTimeout(() => {
    batch.inspectTimer = null;
    void inspectGroup(batch);
  }, getAdvancedConfig().inspectionDelayMs);
}

/** Associate a recently created Tab with the Group it joined. */
export function detectGroup(tab: Tab): void {
  const tabId = tab.id;
  const groupId = tab.groupId ?? -1;
  const recent = tabId === undefined ? undefined : recentTabs.get(tabId);

  if (
    tabId === undefined ||
    !recent ||
    recent.initialGroupId !== -1 ||
    groupId === -1 ||
    Date.now() - recent.createdAt > getAdvancedConfig().restoreWindowMs
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
    titleUpdatedTabIds: new Set<TabId>(),
    protectedTabId: null,
    inspectTimer: null,
    waitForTitleBeforeDiscard: false,
    deadline: Date.now() + getAdvancedConfig().batchTtlMs
  };

  batches.set(groupBatchKey, batch);
  setTimeout(() => {
    if (batch.inspectTimer !== null) {
      clearTimeout(batch.inspectTimer);
    }
    batches.delete(groupBatchKey);
  }, getAdvancedConfig().batchTtlMs);

  return batch;
}

/** Inspect the Group and queue its safe background Tabs for discard. */
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

  const restoreConfig = await loadRestoreConfig();
  if (restoreConfig === null) {
    return;
  }

  batch.waitForTitleBeforeDiscard = restoreConfig.waitForTitleBeforeDiscard;

  // Preserve the existing behavior by skipping discard for small Groups.
  if (groupTabs.length <= restoreConfig.minTabs) {
    return;
  }

  // Groups on the allowlist skip discard.
  try {
    const group = await chrome.tabGroups.get(batch.groupId);
    if (
      group.title !== undefined &&
      restoreConfig.excludedGroupTitles.includes(group.title)
    ) {
      return;
    }
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

  const discardableTabs = trackedTabs.filter((tab) => isDiscardable(tab, batch));
  enqueueDiscard(batch, discardableTabs);
}
