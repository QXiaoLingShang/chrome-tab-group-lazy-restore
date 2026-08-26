/** Implements the extension options page. */
import {
  DEFAULT_RESTORE_CONFIG,
  loadRestoreConfig,
  type RestoreConfig
} from "./config.js";

const form = document.querySelector<HTMLFormElement>("#settings-form");
const minTabsInput = document.querySelector<HTMLInputElement>("#min-tabs");
const titleList = document.querySelector<HTMLDivElement>("#title-list");
const titleEntry = document.querySelector<HTMLDivElement>("#title-entry");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-button");
const saveButton = document.querySelector<HTMLButtonElement>("#save-button");
const toastRegion = document.querySelector<HTMLDivElement>("#toast-region");

if (
  !form ||
  !minTabsInput ||
  !titleList ||
  !titleEntry ||
  !resetButton ||
  !saveButton ||
  !toastRegion
) {
  throw new Error("Options page elements are missing.");
}

const settingsForm = form;
const minTabsField = minTabsInput;
const groupTitleList = titleList;
const groupTitleEntry = titleEntry;
const settingsResetButton = resetButton;
const settingsSaveButton = saveButton;
const settingsToastRegion = toastRegion;

let excludedGroupTitles: string[] = [];

/** Show a temporary notification in the top toast queue. */
function showToast(
  message: string,
  type: "success" | "error" | "pending" = "pending"
): void {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  settingsToastRegion.prepend(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    window.setTimeout(() => toast.remove(), 180);
  }, 3200);
}

/** Mark whether the form contains changes that are not stored yet. */
function setDirty(dirty: boolean): void {
  settingsSaveButton.disabled = !dirty;
}

/** Render stored whitelist rows and a separate add input. */
function renderExcludedTitles(focusLast = false): void {
  groupTitleList.replaceChildren();
  groupTitleEntry.replaceChildren();

  excludedGroupTitles.forEach((title, index) => {
    const row = document.createElement("div");
    row.className = "title-row";
    row.setAttribute("role", "listitem");

    const titleInput = document.createElement("input");
    titleInput.className = "title-input";
    titleInput.type = "text";
    titleInput.autocomplete = "off";
    titleInput.value = title;
    titleInput.setAttribute("aria-label", `Allowlisted group title ${index + 1}`);
    titleInput.addEventListener("input", () => {
      setDirty(true);
    });
    titleInput.addEventListener("change", () => {
      const value = titleInput.value.trim();
      if (!value) {
        excludedGroupTitles.splice(index, 1);
        renderExcludedTitles();
        setDirty(true);
        return;
      }

      excludedGroupTitles[index] = value;
      setDirty(true);
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
      setDirty(true);
    });

    row.append(titleInput, removeButton);
    groupTitleList.append(row);
  });

  const emptyRow = document.createElement("div");
  emptyRow.className = "title-entry-row";

  const emptyInput = document.createElement("input");
  emptyInput.className = "title-input";
  emptyInput.type = "text";
  emptyInput.autocomplete = "off";
  emptyInput.placeholder = "Add group";
  emptyInput.setAttribute("aria-label", "Add allowlisted group title");
  emptyInput.addEventListener("input", () => {
    setDirty(true);
  });

  const commitEmptyInput = (focusNext = false): void => {
    const value = emptyInput.value.trim();
    if (!value) {
      return;
    }

    if (excludedGroupTitles.includes(value)) {
      showToast("This group is already on the allowlist.", "error");
      return;
    }

    excludedGroupTitles.push(value);
    setDirty(true);
    renderExcludedTitles(focusNext);
  };

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

/** Fill the form with a restore configuration. */
function fillForm(config: RestoreConfig): void {
  minTabsField.value = String(config.minTabs);
  excludedGroupTitles = [...config.excludedGroupTitles];
  renderExcludedTitles();
  setDirty(false);
}

/** Load saved settings into the options page. */
async function loadSettings(): Promise<void> {
  const config = await loadRestoreConfig();
  if (config === null) {
    fillForm(DEFAULT_RESTORE_CONFIG);
    showToast("Unable to load settings.", "error");
    return;
  }

  fillForm(config);
}

/** Validate and save the current form settings. */
async function saveSettings(): Promise<void> {
  const minTabs = Number(minTabsField.value);
  if (!Number.isInteger(minTabs) || minTabs < 0) {
    showToast("Minimum tab count must be a non-negative integer.", "error");
    minTabsField.focus();
    return;
  }

  const titleInputs = [
    ...Array.from(groupTitleList.querySelectorAll<HTMLInputElement>(".title-input")),
    ...Array.from(groupTitleEntry.querySelectorAll<HTMLInputElement>(".title-input"))
  ];

  excludedGroupTitles = titleInputs
    .map((input) => input.value.trim())
    .filter(Boolean);

  const config: RestoreConfig = {
    minTabs,
    excludedGroupTitles: [
      ...new Set(excludedGroupTitles.map((title) => title.trim()).filter(Boolean))
    ]
  };

  try {
    await chrome.storage.local.set(config);
    fillForm(config);
    showToast("Settings saved.", "success");
  } catch {
    showToast("Unable to save settings.", "error");
  }
}

/** Restore and save the default settings. */
async function resetSettings(): Promise<void> {
  try {
    await chrome.storage.local.set(DEFAULT_RESTORE_CONFIG);
    fillForm(DEFAULT_RESTORE_CONFIG);
    showToast("Defaults restored.", "success");
  } catch {
    showToast("Unable to restore defaults.", "error");
  }
}

minTabsField.addEventListener("input", () => {
  setDirty(true);
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveSettings();
});

settingsResetButton.addEventListener("click", () => {
  void resetSettings();
});

void loadSettings();
