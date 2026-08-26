/** Settings used to decide whether a restored Group should be discarded. */
export type RestoreConfig = {
  minTabs: number;
  excludedGroupTitles: string[];
};

/** Default settings used before a user saves custom options. */
export const DEFAULT_RESTORE_CONFIG: RestoreConfig = {
  minTabs: 5,
  excludedGroupTitles: []
};

/** Load and normalize restore settings from local extension storage. */
export async function loadRestoreConfig(): Promise<RestoreConfig | null> {
  try {
    const stored = await chrome.storage.local.get(DEFAULT_RESTORE_CONFIG);
    const minTabs = Number(stored.minTabs);
    const titles = Array.isArray(stored.excludedGroupTitles)
      ? stored.excludedGroupTitles.filter(
          (title): title is string => typeof title === "string"
        )
      : DEFAULT_RESTORE_CONFIG.excludedGroupTitles;

    return {
      minTabs:
        Number.isInteger(minTabs) && minTabs >= 0
          ? minTabs
          : DEFAULT_RESTORE_CONFIG.minTabs,
      excludedGroupTitles: [
        ...new Set(titles.map((title) => title.trim()).filter(Boolean))
      ]
    };
  } catch {
    return null;
  }
}
