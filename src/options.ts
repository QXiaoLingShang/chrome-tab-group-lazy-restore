/** Options-page logic for loading, validating, and automatically saving extension settings. */
import {
  DEFAULT_RESTORE_CONFIG,
  loadRestoreConfig,
  type RestoreConfig
} from "./config.js";
import {
  ADVANCED_CONFIG_LIMITS,
  type AdvancedConfig
} from "./advanced-config.js";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Options page element is missing: ${selector}`);
  }
  return element;
}

const settingsForm = requiredElement<HTMLFormElement>("#settings-form");
const minTabsField = requiredElement<HTMLInputElement>("#min-tabs");
const waitForTitleField = requiredElement<HTMLInputElement>("#wait-for-title");
const groupTitleListShell = requiredElement<HTMLDivElement>("#title-list-shell");
const groupTitleList = requiredElement<HTMLDivElement>("#title-list");
const groupTitleListToggle = requiredElement<HTMLButtonElement>("#title-list-toggle");
const groupTitleEntry = requiredElement<HTMLDivElement>("#title-entry");
const addTitleButton = requiredElement<HTMLButtonElement>("#add-title-button");
const settingsResetButton = requiredElement<HTMLButtonElement>("#reset-button");
const settingsToastRegion = requiredElement<HTMLDivElement>("#toast-region");
const saveStatus = requiredElement<HTMLSpanElement>("#save-status");
const minTabsError = requiredElement<HTMLParagraphElement>("#min-tabs-error");
const titleEntryError = requiredElement<HTMLParagraphElement>("#title-entry-error");
const advancedFields: Record<keyof AdvancedConfig, HTMLInputElement> = {
  restoreWindowMs: requiredElement<HTMLInputElement>("#advanced-restore-window"),
  recentTabCleanupPaddingMs: requiredElement<HTMLInputElement>("#advanced-cleanup-padding"),
  inspectionDelayMs: requiredElement<HTMLInputElement>("#advanced-inspection-delay"),
  batchTtlMs: requiredElement<HTMLInputElement>("#advanced-batch-ttl"),
  discardGapMs: requiredElement<HTMLInputElement>("#advanced-discard-gap"),
  retryDelayMs: requiredElement<HTMLInputElement>("#advanced-retry-delay"),
  maxDiscardRetries: requiredElement<HTMLInputElement>("#advanced-max-retries"),
  maxConcurrentDiscards: requiredElement<HTMLInputElement>("#advanced-concurrency")
};
const advancedLabels: Record<keyof AdvancedConfig, string> = {
  restoreWindowMs: "Restore detection window",
  recentTabCleanupPaddingMs: "Detection cleanup margin",
  inspectionDelayMs: "Group inspection delay",
  batchTtlMs: "Restore batch lifetime",
  discardGapMs: "Discard start gap",
  retryDelayMs: "Retry delay",
  maxDiscardRetries: "Maximum discard retries",
  maxConcurrentDiscards: "Discard concurrency"
};
const advancedKeys = Object.keys(advancedFields) as Array<keyof AdvancedConfig>;
const advancedErrors: Record<keyof AdvancedConfig, HTMLSpanElement> = {
  restoreWindowMs: requiredElement<HTMLSpanElement>("#advanced-restore-window-error"),
  recentTabCleanupPaddingMs: requiredElement<HTMLSpanElement>("#advanced-cleanup-padding-error"),
  inspectionDelayMs: requiredElement<HTMLSpanElement>("#advanced-inspection-delay-error"),
  batchTtlMs: requiredElement<HTMLSpanElement>("#advanced-batch-ttl-error"),
  discardGapMs: requiredElement<HTMLSpanElement>("#advanced-discard-gap-error"),
  retryDelayMs: requiredElement<HTMLSpanElement>("#advanced-retry-delay-error"),
  maxDiscardRetries: requiredElement<HTMLSpanElement>("#advanced-max-retries-error"),
  maxConcurrentDiscards: requiredElement<HTMLSpanElement>("#advanced-concurrency-error")
};

let excludedGroupTitles: string[] = [];
const MAX_VISIBLE_TITLE_ROWS = 5;
const TITLE_LIST_LABELS = {
  more: "Show more groups",
  less: "Show less groups"
} as const;
let saveTimer: number | null = null;
let saveStatusTimer: number | null = null;

function setSaveStatus(
  message: string,
  state: "saving" | "saved" | "error" | "" = ""
): void {
  if (saveStatusTimer !== null) {
    window.clearTimeout(saveStatusTimer);
    saveStatusTimer = null;
  }

  saveStatus.textContent = message;
  saveStatus.className = state ? `save-status is-${state}` : "save-status";

  if (state === "saved") {
    saveStatusTimer = window.setTimeout(() => {
      saveStatus.textContent = "";
      saveStatus.className = "save-status";
      saveStatusTimer = null;
    }, 1800);
  }
}

function setFieldError(
  field: HTMLInputElement,
  errorElement: HTMLElement,
  message: string
): void {
  errorElement.textContent = message;
  errorElement.hidden = !message;
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

function clearValidationMessages(): void {
  setFieldError(minTabsField, minTabsError, "");
  titleEntryError.textContent = "";
  titleEntryError.hidden = true;
  for (const key of advancedKeys) {
    setFieldError(advancedFields[key], advancedErrors[key], "");
  }
}

/** Show a temporary notification in the toast region. */
function showToast(
  message: string,
  type: "success" | "error" | "pending" = "pending"
): void {
  const toastDuration = 3200;
  const toastExitDuration = 180;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const messageElement = document.createElement("span");
  messageElement.className = "toast-message";
  messageElement.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.className = "toast-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Dismiss notification");
  closeButton.textContent = "×";

  let dismissTimer: number | null = null;
  let isDismissing = false;

  const clearDismissTimer = (): void => {
    if (dismissTimer !== null) {
      window.clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  };

  const dismissToast = (): void => {
    if (isDismissing) {
      return;
    }

    isDismissing = true;
    clearDismissTimer();
    toast.classList.add("leaving");
    window.setTimeout(() => toast.remove(), toastExitDuration);
  };

  const scheduleDismiss = (): void => {
    if (isDismissing) {
      return;
    }

    clearDismissTimer();
    dismissTimer = window.setTimeout(dismissToast, toastDuration);
  };

  toast.addEventListener("mouseenter", clearDismissTimer);
  toast.addEventListener("mouseleave", scheduleDismiss);
  closeButton.addEventListener("click", dismissToast);
  toast.append(messageElement, closeButton);
  settingsToastRegion.prepend(toast);
  scheduleDismiss();
}

/** Save changed settings after a short pause to avoid writing on every input change. */
function scheduleSave(): void {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
  }

  setSaveStatus("Saving…", "saving");
  // Use a short debounce after removing the Save button to reduce frequent storage writes.
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    void saveSettings();
  }, 200);
}

function cancelScheduledSave(): void {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
}

function setTitleListCollapsed(collapsed: boolean): void {
  const hasLongList = excludedGroupTitles.length > MAX_VISIBLE_TITLE_ROWS;
  // fix: Collapse only on the initial load; keep the list open after edits or additions.
  const isCollapsed = collapsed && hasLongList;

  groupTitleListShell.classList.toggle("is-collapsed", isCollapsed);
  groupTitleListToggle.hidden = !hasLongList;
  groupTitleListToggle.textContent = isCollapsed ? TITLE_LIST_LABELS.more : TITLE_LIST_LABELS.less;
  groupTitleListToggle.setAttribute("aria-expanded", String(!isCollapsed));
}

function createTitleInput(value = ""): HTMLInputElement {
  const input = document.createElement("input");
  input.className = "title-input";
  input.type = "text";
  input.autocomplete = "off";
  input.value = value;
  return input;
}

/** Render allowlist rows and the Add group input in the same foldable region. */
function renderExcludedTitles(focusLast = false, collapseLongList = false): void {
  groupTitleList.replaceChildren();
  groupTitleEntry.replaceChildren();

  excludedGroupTitles.forEach((title, index) => {
    const row = document.createElement("div");
    row.className = "title-row";
    row.setAttribute("role", "listitem");

    const titleInput = createTitleInput(title);
    titleInput.setAttribute("aria-label", `Allowlisted group title ${index + 1}`);
    titleInput.addEventListener("change", () => {
      const value = titleInput.value.trim();
      if (!value) {
        excludedGroupTitles.splice(index, 1);
        renderExcludedTitles();
        scheduleSave();
        return;
      }

      excludedGroupTitles[index] = value;
      scheduleSave();
    });
    titleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        titleInput.blur();
      }
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove-title";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove allowlisted group: ${title}`);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      excludedGroupTitles.splice(index, 1);
      renderExcludedTitles();
      scheduleSave();
    });

    row.append(titleInput, removeButton);
    groupTitleList.append(row);
  });

  setTitleListCollapsed(collapseLongList);

  const emptyRow = document.createElement("div");
  emptyRow.className = "title-entry-row";

  const emptyInput = createTitleInput();
  emptyInput.placeholder = "Add group";
  emptyInput.setAttribute("aria-label", "Add allowlisted group title");
  // fix: Enter can be followed by change on the old input; block the second commit and false duplicate error.
  let hasCommitted = false;

  const commitEmptyInput = (focusNext = false): void => {
    if (hasCommitted) {
      return;
    }

    const value = emptyInput.value.trim();
    if (!value) {
      return;
    }

    if (excludedGroupTitles.includes(value)) {
      setFieldError(emptyInput, titleEntryError, "This group is already on the allowlist.");
      return;
    }

    setFieldError(emptyInput, titleEntryError, "");
    hasCommitted = true;
    excludedGroupTitles.push(value);
    renderExcludedTitles(focusNext);
    scheduleSave();
  };

  emptyInput.addEventListener("input", () => {
    setFieldError(emptyInput, titleEntryError, "");
  });
  emptyInput.addEventListener("change", () => commitEmptyInput());
  emptyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEmptyInput(true);
    }
  });

  const emptySpacer = document.createElement("span");
  emptySpacer.className = "entry-spacer";
  emptySpacer.setAttribute("aria-hidden", "true");
  emptyRow.append(emptyInput, emptySpacer);
  groupTitleEntry.append(emptyRow);

  if (focusLast) {
    emptyInput.focus();
  }
}

groupTitleListToggle.addEventListener("click", () => {
  setTitleListCollapsed(!groupTitleListShell.classList.contains("is-collapsed"));
});

addTitleButton.addEventListener("click", () => {
  // The + entry expands the allowlist and focuses the Add group input.
  setTitleListCollapsed(false);
  groupTitleEntry.querySelector<HTMLInputElement>(".title-input")?.focus();
});

/** Fill the options page with a restore configuration. */
function fillForm(config: RestoreConfig, collapseLongList = false): void {
  clearValidationMessages();
  setSaveStatus("");
  minTabsField.value = String(config.minTabs);
  waitForTitleField.checked = config.waitForTitleBeforeDiscard;
  for (const key of advancedKeys) {
    advancedFields[key].value = String(config.advanced[key]);
  }
  excludedGroupTitles = [...config.excludedGroupTitles];
  renderExcludedTitles(false, collapseLongList);
}

/** Read and validate internal tuning values from the Advanced settings. */
function readAdvancedConfig(): AdvancedConfig | null {
  const values = {} as AdvancedConfig;

  for (const key of advancedKeys) {
    const value = Number(advancedFields[key].value);
    const limits = ADVANCED_CONFIG_LIMITS[key];
    if (!Number.isInteger(value) || value < limits.min || value > limits.max) {
      setFieldError(
        advancedFields[key],
        advancedErrors[key],
        `${advancedLabels[key]} must be an integer between ${limits.min} and ${limits.max}.`
      );
      setSaveStatus("Fix the highlighted field.", "error");
      advancedFields[key].focus();
      return null;
    }
    setFieldError(advancedFields[key], advancedErrors[key], "");
    values[key] = value;
  }

  return values;
}

/** Load saved settings into the options page. */
async function loadSettings(): Promise<void> {
  const config = await loadRestoreConfig();
  if (config === null) {
    fillForm(DEFAULT_RESTORE_CONFIG);
    showToast("Unable to load settings.", "error");
    return;
  }

  fillForm(config, true);
}

/** Validate and save the current settings. */
async function saveSettings(): Promise<void> {
  const minTabs = Number(minTabsField.value);
  if (!Number.isInteger(minTabs) || minTabs < 0) {
    setFieldError(minTabsField, minTabsError, "Minimum tab count must be a non-negative integer.");
    setSaveStatus("Fix the highlighted field.", "error");
    minTabsField.focus();
    return;
  }
  setFieldError(minTabsField, minTabsError, "");

  const advanced = readAdvancedConfig();
  if (advanced === null) {
    return;
  }

  excludedGroupTitles = Array.from(
    groupTitleListShell.querySelectorAll<HTMLInputElement>(".title-input")
  )
    .map((input) => input.value.trim())
    .filter(Boolean);

  const config: RestoreConfig = {
    minTabs,
    excludedGroupTitles: [
      ...new Set(excludedGroupTitles.map((title) => title.trim()).filter(Boolean))
    ],
    waitForTitleBeforeDiscard: waitForTitleField.checked,
    advanced
  };

  try {
    await chrome.storage.local.set(config);
    setSaveStatus("Saved", "saved");
  } catch {
    setSaveStatus("Unable to save", "error");
    showToast("Unable to save settings automatically.", "error");
  }
}

/** Restore and save the default settings. */
async function resetSettings(): Promise<void> {
  try {
    // Cancel the pending auto-save before reset so stale values cannot overwrite defaults.
    cancelScheduledSave();
    setSaveStatus("Saving…", "saving");
    await chrome.storage.local.set(DEFAULT_RESTORE_CONFIG);
    fillForm(DEFAULT_RESTORE_CONFIG);
    setSaveStatus("Saved", "saved");
    showToast("Defaults restored.", "success");
  } catch {
    setSaveStatus("Unable to save", "error");
    showToast("Unable to restore defaults.", "error");
  }
}

[
  minTabsField,
  waitForTitleField,
  ...Object.values(advancedFields)
].forEach((field) => {
  field.addEventListener("change", scheduleSave);
});

minTabsField.addEventListener("input", () => {
  setFieldError(minTabsField, minTabsError, "");
});

for (const key of advancedKeys) {
  advancedFields[key].addEventListener("input", () => {
    setFieldError(advancedFields[key], advancedErrors[key], "");
  });
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveSettings();
});

settingsResetButton.addEventListener("click", () => {
  void resetSettings();
});

void loadSettings();
