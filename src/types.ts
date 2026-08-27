/** Shared Chrome Tab and restore-batch types. */
export type Tab = chrome.tabs.Tab;
export type TabId = NonNullable<Tab["id"]>;
export type Timer = ReturnType<typeof setTimeout>;

export type RecentTab = {
  createdAt: number;
  initialGroupId: number;
};

export type GroupBatch = {
  windowId: number;
  groupId: number;
  tabIds: Set<TabId>;
  titleUpdatedTabIds: Set<TabId>;
  protectedTabId: TabId | null;
  inspectTimer: Timer | null;
  waitForTitleBeforeDiscard: boolean;
  deadline: number;
};
