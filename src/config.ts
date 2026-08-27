import {
  ADVANCED_CONFIG_LIMITS,
  DEFAULT_ADVANCED_CONFIG,
  setAdvancedConfig,
  type AdvancedConfig
} from "./advanced-config.js";

/** Settings used to decide whether a restored Group should be discarded. */
export type RestoreConfig = {
  minTabs: number;
  excludedGroupTitles: string[];
  waitForTitleBeforeDiscard: boolean;
  advanced: AdvancedConfig;
};

/** Default settings used before a user saves custom options. */
export const DEFAULT_RESTORE_CONFIG: RestoreConfig = {
  minTabs: 5,
  excludedGroupTitles: [],
  waitForTitleBeforeDiscard: false,
  advanced: { ...DEFAULT_ADVANCED_CONFIG }
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readAdvancedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max
    ? number
    : fallback;
}

/** Load settings from local extension storage and support older stored data. */
export async function loadRestoreConfig(): Promise<RestoreConfig | null> {
  try {
    const stored = await chrome.storage.local.get(DEFAULT_RESTORE_CONFIG);
    const minTabs = Number(stored.minTabs);
    const titles = Array.isArray(stored.excludedGroupTitles)
      ? stored.excludedGroupTitles.filter(
          (title): title is string => typeof title === "string"
        )
      : DEFAULT_RESTORE_CONFIG.excludedGroupTitles;
    const waitForTitleBeforeDiscard =
      typeof stored.waitForTitleBeforeDiscard === "boolean"
        ? stored.waitForTitleBeforeDiscard
        : DEFAULT_RESTORE_CONFIG.waitForTitleBeforeDiscard;
    // Support stored data without advanced settings and clamp tuning values to safe ranges.
    const storedAdvanced = isObject(stored.advanced) ? stored.advanced : {};
    const advanced: AdvancedConfig = {
      restoreWindowMs: readAdvancedNumber(
        storedAdvanced.restoreWindowMs,
        DEFAULT_ADVANCED_CONFIG.restoreWindowMs,
        ADVANCED_CONFIG_LIMITS.restoreWindowMs.min,
        ADVANCED_CONFIG_LIMITS.restoreWindowMs.max
      ),
      recentTabCleanupPaddingMs: readAdvancedNumber(
        storedAdvanced.recentTabCleanupPaddingMs,
        DEFAULT_ADVANCED_CONFIG.recentTabCleanupPaddingMs,
        ADVANCED_CONFIG_LIMITS.recentTabCleanupPaddingMs.min,
        ADVANCED_CONFIG_LIMITS.recentTabCleanupPaddingMs.max
      ),
      inspectionDelayMs: readAdvancedNumber(
        storedAdvanced.inspectionDelayMs,
        DEFAULT_ADVANCED_CONFIG.inspectionDelayMs,
        ADVANCED_CONFIG_LIMITS.inspectionDelayMs.min,
        ADVANCED_CONFIG_LIMITS.inspectionDelayMs.max
      ),
      batchTtlMs: readAdvancedNumber(
        storedAdvanced.batchTtlMs,
        DEFAULT_ADVANCED_CONFIG.batchTtlMs,
        ADVANCED_CONFIG_LIMITS.batchTtlMs.min,
        ADVANCED_CONFIG_LIMITS.batchTtlMs.max
      ),
      discardGapMs: readAdvancedNumber(
        storedAdvanced.discardGapMs,
        DEFAULT_ADVANCED_CONFIG.discardGapMs,
        ADVANCED_CONFIG_LIMITS.discardGapMs.min,
        ADVANCED_CONFIG_LIMITS.discardGapMs.max
      ),
      retryDelayMs: readAdvancedNumber(
        storedAdvanced.retryDelayMs,
        DEFAULT_ADVANCED_CONFIG.retryDelayMs,
        ADVANCED_CONFIG_LIMITS.retryDelayMs.min,
        ADVANCED_CONFIG_LIMITS.retryDelayMs.max
      ),
      maxDiscardRetries: readAdvancedNumber(
        storedAdvanced.maxDiscardRetries,
        DEFAULT_ADVANCED_CONFIG.maxDiscardRetries,
        ADVANCED_CONFIG_LIMITS.maxDiscardRetries.min,
        ADVANCED_CONFIG_LIMITS.maxDiscardRetries.max
      ),
      maxConcurrentDiscards: readAdvancedNumber(
        storedAdvanced.maxConcurrentDiscards,
        DEFAULT_ADVANCED_CONFIG.maxConcurrentDiscards,
        ADVANCED_CONFIG_LIMITS.maxConcurrentDiscards.min,
        ADVANCED_CONFIG_LIMITS.maxConcurrentDiscards.max
      )
    };

    setAdvancedConfig(advanced);

    return {
      minTabs:
        Number.isInteger(minTabs) && minTabs >= 0
          ? minTabs
          : DEFAULT_RESTORE_CONFIG.minTabs,
      excludedGroupTitles: [
        ...new Set(titles.map((title) => title.trim()).filter(Boolean))
      ],
      waitForTitleBeforeDiscard,
      advanced
    };
  } catch {
    return null;
  }
}
