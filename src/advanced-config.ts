/** Internal tuning values exposed under the collapsed Advanced settings section. */
//#region Advanced internal settings (collapsed by default)
export type AdvancedConfig = {
  restoreWindowMs: number;
  recentTabCleanupPaddingMs: number;
  inspectionDelayMs: number;
  batchTtlMs: number;
  discardGapMs: number;
  retryDelayMs: number;
  maxDiscardRetries: number;
  maxConcurrentDiscards: number;
};

export const DEFAULT_ADVANCED_CONFIG: AdvancedConfig = {

  restoreWindowMs: 5000,            /** How long a newly created Tab can wait to join a restore batch. */
  recentTabCleanupPaddingMs: 100,   /** Extra cleanup margin after the restore-window timer fires. */
  inspectionDelayMs: 300,           /** Debounce delay before inspecting a Group after its Tabs are assembled. */
  batchTtlMs: 15000,                /** Lifetime of a restore batch and the maximum title-wait period. */
  discardGapMs: 10,                 /** Small pause before starting more discard work. */
  retryDelayMs: 250,                /** Delay between title checks or transient discard retries. */
  maxDiscardRetries: 5,             /** Maximum retries after a discard API failure. */
  maxConcurrentDiscards: 4          /** Maximum number of in-flight discard operations. */
} as const;

export const ADVANCED_CONFIG_LIMITS = {
  restoreWindowMs: { min: 1000, max: 60000 },
  recentTabCleanupPaddingMs: { min: 0, max: 10000 },
  inspectionDelayMs: { min: 0, max: 5000 },
  batchTtlMs: { min: 1000, max: 120000 },
  discardGapMs: { min: 0, max: 1000 },
  retryDelayMs: { min: 50, max: 5000 },
  maxDiscardRetries: { min: 0, max: 20 },
  maxConcurrentDiscards: { min: 1, max: 8 }
} as const;

let activeAdvancedConfig: AdvancedConfig = { ...DEFAULT_ADVANCED_CONFIG };

export function getAdvancedConfig(): AdvancedConfig {
  return activeAdvancedConfig;
}

export function setAdvancedConfig(config: AdvancedConfig): void {
  activeAdvancedConfig = { ...config };
}
//#endregion
