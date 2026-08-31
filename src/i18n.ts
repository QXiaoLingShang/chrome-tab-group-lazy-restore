/** Lightweight localization helpers for the options page. */

export type Language = "en" | "zh-CN";

const LANGUAGE_STORAGE_KEY = "optionsLanguage";

const englishMessages = {
  pageTitle: "Tab Group Restore Settings",
  restoreDefaults: "Restore defaults",
  saved: "Saved",
  saving: "Saving…",
  unableToSave: "Save failed",
  fixHighlightedField: "Check the highlighted fields.",
  minimumTabCount: "Minimum number of tabs",
  minimumTabCountDescription: "Groups with this number of tabs or fewer won't be discarded.",
  minimumTabCountError: "Enter a non-negative whole number.",
  waitForTabTitles: "Wait for tab titles before discarding",
  experimental: "Experimental",
  waitForTabTitlesDescription: "Wait for a tab's title to load before discarding it.",
  waitForTabTitlesAriaLabel: "Wait for tab titles before discarding tabs",
  waitForTabTitlesWarning:
    "Experimental: This may keep memory usage high for longer while a group is opening.",
  groupAllowlist: "Protected group names",
  groupAllowlistDescription:
    "Tabs in groups whose names exactly match a name below won't be discarded.",
  addGroupToAllowlistAriaLabel: "Add a protected group name",
  showMoreGroups: "Show more groups",
  showLessGroups: "Show fewer groups",
  allowlistedGroupTitleAriaLabel: "Protected group name {index}",
  removeAllowlistedGroupAriaLabel: "Remove protected group: {title}",
  addGroupPlaceholder: "Add group name",
  addAllowlistedGroupAriaLabel: "Add a protected group name",
  duplicateGroupError: "This group name is already protected.",
  advancedSettings: "Advanced settings",
  advancedSettingsDescription:
    "Adjust restore timing, retry behavior, and the number of tabs discarded at once.",
  restoreDetectionWindow: "Restore detection window (ms)",
  restoreDetectionWindowDescription:
    "After a tab is created, this is how long it can be recognized as part of a group restore.",
  detectionCleanupMargin: "Detection cleanup delay (ms)",
  detectionCleanupMarginDescription:
    "Extra time to keep tracking a new tab after the detection window ends.",
  groupInspectionDelay: "Group check delay (ms)",
  groupInspectionDelayDescription:
    "Wait this long after tabs join a group before checking which tabs can be discarded.",
  restoreBatchLifetime: "Restore timeout (ms)",
  restoreBatchLifetimeDescription:
    "Maximum time to handle a group restore, including time spent waiting for tab titles.",
  discardStartGap: "Delay between discards (ms)",
  discardStartGapDescription:
    "Wait this long before starting the next discard operation.",
  retryDelay: "Retry delay (ms)",
  retryDelayDescription:
    "Maximum time to wait before checking a title again or retrying a failed discard.",
  maximumDiscardRetries: "Maximum discard retries",
  maximumDiscardRetriesDescription:
    "Maximum number of times to retry a failed discard operation.",
  discardConcurrency: "Simultaneous tab discards",
  discardConcurrencyDescription:
    "Maximum number of tabs that can be discarded at the same time.",
  advancedIntegerRangeError: "Enter a whole number between {min} and {max}.",
  unableToLoadSettings: "Couldn't load settings.",
  unableToSaveSettingsAutomatically: "Couldn't save settings automatically.",
  defaultsRestored: "Defaults restored.",
  unableToRestoreDefaults: "Couldn't restore defaults.",
  unableToRememberLanguage: "Couldn't save language preference.",
  dismissNotification: "Dismiss notification",
  footerLinks: "Footer links",
  languageSwitchLabel: "Language",
  mitLicense: "MIT License",
  github: "GitHub"
} as const;

export type TranslationKey = keyof typeof englishMessages;

const messages: Record<Language, Record<TranslationKey, string>> = {
  en: englishMessages,
  "zh-CN": {
    pageTitle: "标签组恢复设置",
    restoreDefaults: "恢复默认设置",
    saved: "已保存",
    saving: "保存中…",
    unableToSave: "保存失败",
    fixHighlightedField: "请检查突出显示的输入项。",
    minimumTabCount: "最少标签页数量",
    minimumTabCountDescription: "标签页数量少于或等于此值的标签组不会被释放。",
    minimumTabCountError: "请输入大于或等于 0 的整数。",
    waitForTabTitles: "等待标签页标题加载",
    experimental: "实验功能",
    waitForTabTitlesDescription: "等待标签页标题加载完成后再释放。",
    waitForTabTitlesAriaLabel: "释放标签页前等待标题加载",
    waitForTabTitlesWarning:
      "实验功能：打开标签组时，等待标签页标题加载可能使内存占用在峰值附近维持更久。",
    groupAllowlist: "受保护的标签组名称",
    groupAllowlistDescription:
      "名称与下方任一名称完全一致的标签组，其标签页不会被释放。",
    addGroupToAllowlistAriaLabel: "添加受保护的标签组名称",
    showMoreGroups: "显示更多标签组",
    showLessGroups: "显示更少标签组",
    allowlistedGroupTitleAriaLabel: "第 {index} 个受保护的标签组名称",
    removeAllowlistedGroupAriaLabel: "移除受保护标签组：{title}",
    addGroupPlaceholder: "添加标签组名称",
    addAllowlistedGroupAriaLabel: "添加受保护的标签组名称",
    duplicateGroupError: "该标签组名称已设置为受保护。",
    advancedSettings: "高级设置",
    advancedSettingsDescription:
      "调整标签组恢复时间、失败重试方式以及同时释放的标签页数量。",
    restoreDetectionWindow: "恢复检测窗口（ms）",
    restoreDetectionWindowDescription:
      "标签页创建后，在这段时间内仍可被识别为此次标签组恢复的一部分。",
    detectionCleanupMargin: "检测清理延迟（ms）",
    detectionCleanupMarginDescription:
      "检测窗口结束后，继续跟踪新建标签页的额外时间。",
    groupInspectionDelay: "标签组检查延迟（ms）",
    groupInspectionDelayDescription:
      "标签页加入标签组后，等待这段时间再检查哪些标签页可以释放。",
    restoreBatchLifetime: "恢复超时（ms）",
    restoreBatchLifetimeDescription:
      "一次标签组恢复最多持续的时间，包括等待标签页标题的时间。",
    discardStartGap: "释放间隔（ms）",
    discardStartGapDescription:
      "等待这段时间后，再开始下一次释放操作。",
    retryDelay: "重试延迟（ms）",
    retryDelayDescription:
      "再次检查标题或重试释放失败的标签页前，最多等待的时间。",
    maximumDiscardRetries: "释放重试次数上限",
    maximumDiscardRetriesDescription:
      "释放操作失败后，最多重试的次数。",
    discardConcurrency: "同时释放数量上限",
    discardConcurrencyDescription: "同时最多释放的标签页数量。",
    advancedIntegerRangeError: "请输入 {min} 到 {max} 之间的整数。",
    unableToLoadSettings: "无法加载设置。",
    unableToSaveSettingsAutomatically: "无法自动保存设置。",
    defaultsRestored: "已恢复默认设置。",
    unableToRestoreDefaults: "无法恢复默认设置。",
    unableToRememberLanguage: "无法保存语言偏好设置。",
    dismissNotification: "关闭通知",
    footerLinks: "页脚链接",
    languageSwitchLabel: "语言",
    mitLicense: "MIT 许可证",
    github: "GitHub"
  }
};

type TranslationParameters = Record<string, string | number>;
type LocalizedDescriptor =
  | {
      element: Element;
      kind: "text";
      key: TranslationKey;
      parameters?: TranslationParameters;
    }
  | {
      element: Element;
      kind: "attribute";
      attribute: string;
      key: TranslationKey;
      parameters?: TranslationParameters;
    };

let currentLanguage: Language = "en";
const localizedDescriptors = new Set<LocalizedDescriptor>();

function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "zh-CN";
}

function isTranslationKey(value: string): value is TranslationKey {
  return value in englishMessages;
}

/** Resolve Chinese for any Chinese browser locale and English everywhere else. */
function detectBrowserLanguage(): Language {
  const browserLanguages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  return browserLanguages.some((language) => language.toLowerCase().startsWith("zh"))
    ? "zh-CN"
    : "en";
}

/** Replace named placeholders without allowing missing values to erase the template. */
function interpolate(template: string, parameters?: TranslationParameters): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = parameters?.[name];
    return value === undefined ? placeholder : String(value);
  });
}

/** Remove an older dynamic descriptor before registering its replacement. */
function forgetDescriptor(element: Element, kind: LocalizedDescriptor["kind"], attribute?: string): void {
  for (const descriptor of localizedDescriptors) {
    if (
      descriptor.element === element &&
      (kind === "text"
        ? descriptor.kind === "text"
        : descriptor.kind === "attribute" && descriptor.attribute === attribute)
    ) {
      localizedDescriptors.delete(descriptor);
    }
  }
}

/** Render one dynamic descriptor using the current language and its saved parameters. */
function renderDescriptor(descriptor: LocalizedDescriptor): void {
  const message = t(descriptor.key, descriptor.parameters);
  if (descriptor.kind === "text") {
    descriptor.element.textContent = message;
  } else {
    descriptor.element.setAttribute(descriptor.attribute, message);
  }
}

/** Translate a message using the currently selected language. */
export function t(key: TranslationKey, parameters?: TranslationParameters): string {
  return interpolate(messages[currentLanguage][key], parameters);
}

/** Apply the selected language to static and dynamically registered page content. */
export function applyTranslations(): void {
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key && isTranslationKey(key)) {
      element.textContent = t(key);
    }
  });

  const localizedAttributes = ["aria-label", "placeholder", "title"] as const;
  for (const attribute of localizedAttributes) {
    const marker = `data-i18n-${attribute}`;
    document.querySelectorAll<HTMLElement>(`[${marker}]`).forEach((element) => {
      const key = element.getAttribute(marker);
      if (key && isTranslationKey(key)) {
        element.setAttribute(attribute, t(key));
      }
    });
  }

  for (const descriptor of [...localizedDescriptors]) {
    if (!descriptor.element.isConnected) {
      localizedDescriptors.delete(descriptor);
      continue;
    }
    renderDescriptor(descriptor);
  }
}

/** Set the active language and immediately refresh every localized element. */
export function setLanguage(language: Language): void {
  currentLanguage = language;
  applyTranslations();
}

/** Return the language currently used by the options page. */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/** Load the saved language preference, falling back to the browser language. */
export async function loadLanguagePreference(): Promise<Language> {
  try {
    const stored = await chrome.storage.local.get({ [LANGUAGE_STORAGE_KEY]: null });
    return isLanguage(stored[LANGUAGE_STORAGE_KEY])
      ? stored[LANGUAGE_STORAGE_KEY]
      : detectBrowserLanguage();
  } catch {
    return detectBrowserLanguage();
  }
}

/** Persist the manually selected language for future options-page visits. */
export async function saveLanguagePreference(language: Language): Promise<void> {
  await chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: language });
}

/** Set a localized text node and keep it synchronized with future language changes. */
export function setLocalizedText(
  element: Element,
  key: TranslationKey | "",
  parameters?: TranslationParameters
): void {
  forgetDescriptor(element, "text");
  if (!key) {
    element.textContent = "";
    return;
  }

  const descriptor: LocalizedDescriptor = { element, kind: "text", key, parameters };
  localizedDescriptors.add(descriptor);
  renderDescriptor(descriptor);
}

/** Set a localized attribute and keep it synchronized with future language changes. */
export function setLocalizedAttribute(
  element: Element,
  attribute: string,
  key: TranslationKey,
  parameters?: TranslationParameters
): void {
  forgetDescriptor(element, "attribute", attribute);
  const descriptor: LocalizedDescriptor = { element, kind: "attribute", attribute, key, parameters };
  localizedDescriptors.add(descriptor);
  renderDescriptor(descriptor);
}
