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
    fixHighlightedField: "请检查标红的输入项。",
    minimumTabCount: "最少标签页数",
    minimumTabCountDescription: "标签页数不超过此值的标签组不会被释放。",
    minimumTabCountError: "最少标签页数必须是大于等于 0 的整数。",
    waitForTabTitles: "等待标签页标题",
    experimental: "实验功能",
    waitForTabTitlesDescription: "等标签页标题更新后，再释放该标签页。",
    waitForTabTitlesAriaLabel: "释放标签页前等待其标题更新",
    waitForTabTitlesWarning:
      "实验功能：标签组打开时，等待标题会让内存占用高位维持更久。",
    groupAllowlist: "标签组名称白名单",
    groupAllowlistDescription:
      "标签组名称与白名单条目完全一致时，其中的标签页不会被释放。",
    addGroupToAllowlistAriaLabel: "将标签组名称加入白名单",
    showMoreGroups: "显示更多标签组",
    showLessGroups: "收起标签组",
    allowlistedGroupTitleAriaLabel: "白名单中的标签组名称 {index}",
    removeAllowlistedGroupAriaLabel: "从白名单移除标签组：{title}",
    addGroupPlaceholder: "添加标签组名称",
    addAllowlistedGroupAriaLabel: "添加要加入白名单的标签组名称",
    duplicateGroupError: "该标签组名称已在白名单中。",
    advancedSettings: "高级恢复与标签页释放设置",
    advancedSettingsDescription:
      "调整识别恢复标签组和释放后台标签页时使用的时间与并发上限。",
    restoreDetectionWindow: "恢复识别窗口（ms）",
    restoreDetectionWindowDescription:
      "标签页创建后，在这段时间内仍可被认定为这次标签组恢复的一部分。",
    detectionCleanupMargin: "识别清理余量（ms）",
    detectionCleanupMarginDescription:
      "识别窗口结束后，清理未匹配的新建标签页记录前额外等待的时间。",
    groupInspectionDelay: "标签组检查延迟（ms）",
    groupInspectionDelayDescription:
      "发现标签页加入标签组后，等待标签组完成组装再检查可释放标签页的时间。",
    restoreBatchLifetime: "恢复批次时限（ms）",
    restoreBatchLifetimeDescription:
      "一次恢复批次最多保持活跃的时间，也就是等待标题更新的最长时间。",
    discardStartGap: "释放任务间隔（ms）",
    discardStartGapDescription:
      "一个释放任务完成后，启动下一批释放工作前的等待时间。",
    retryDelay: "重试等待时间（ms）",
    retryDelayDescription:
      "标题检查或 tabs.discard 临时失败后，再次尝试前的最长等待时间，且不会超过批次时限。",
    maximumDiscardRetries: "最大释放重试次数",
    maximumDiscardRetriesDescription:
      "tabs.discard 调用失败后最多重试的次数，不包括标题等待重试。",
    discardConcurrency: "同时释放数量上限",
    discardConcurrencyDescription: "同时执行的 tabs.discard 调用数上限。",
    advancedIntegerRangeError: "请输入 {min} 到 {max} 之间的整数。",
    unableToLoadSettings: "设置加载失败。",
    unableToSaveSettingsAutomatically: "设置自动保存失败。",
    defaultsRestored: "已恢复默认设置。",
    unableToRestoreDefaults: "恢复默认设置失败。",
    unableToRememberLanguage: "语言偏好保存失败。",
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
