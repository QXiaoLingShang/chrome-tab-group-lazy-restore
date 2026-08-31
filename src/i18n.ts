/** Lightweight localization helpers for the options page. */

export type Language = "en" | "zh-CN";

const LANGUAGE_STORAGE_KEY = "optionsLanguage";

const englishMessages = {
  pageTitle: "Tab Group Restore Settings",
  restoreDefaults: "Restore defaults",
  saved: "Saved",
  saving: "Saving…",
  unableToSave: "Unable to save",
  fixHighlightedField: "Fix the highlighted field.",
  minimumTabCount: "Minimum tab count",
  minimumTabCountDescription: "Groups at or below this count skip discard.",
  minimumTabCountError: "Minimum tab count must be a non-negative integer.",
  waitForTabTitles: "Wait for tab titles",
  experimental: "Experimental",
  waitForTabTitlesDescription: "Wait for a title update before discarding that tab.",
  waitForTabTitlesAriaLabel: "Wait for tab titles before discard",
  waitForTabTitlesWarning:
    "Experimental: this can prolong the high-memory period while a Group is opening, because Tabs wait longer before discard.",
  groupAllowlist: "Group allowlist",
  groupAllowlistDescription: "Matching group titles skip discard.",
  addGroupToAllowlistAriaLabel: "Add group to allowlist",
  showMoreGroups: "Show more groups",
  showLessGroups: "Show less groups",
  allowlistedGroupTitleAriaLabel: "Allowlisted group title {index}",
  removeAllowlistedGroupAriaLabel: "Remove allowlisted group: {title}",
  addGroupPlaceholder: "Add group",
  addAllowlistedGroupAriaLabel: "Add allowlisted group title",
  duplicateGroupError: "This group is already on the allowlist.",
  advancedSettings: "Advanced settings",
  advancedSettingsDescription: "Fine-tune restore timing, retries, and discard concurrency.",
  restoreDetectionWindow: "Restore detection window",
  restoreDetectionWindowDescription: "How long a new Tab can join the restore batch.",
  detectionCleanupMargin: "Detection cleanup margin",
  detectionCleanupMarginDescription: "Extra time before stale new-Tab tracking is removed.",
  groupInspectionDelay: "Group inspection delay",
  groupInspectionDelayDescription: "Debounce time that lets a restored Group finish assembling.",
  restoreBatchLifetime: "Restore batch lifetime",
  restoreBatchLifetimeDescription: "Maximum time title waiting can delay discard.",
  discardStartGap: "Discard start gap",
  discardStartGapDescription: "Pause before starting another discard worker.",
  retryDelay: "Retry delay",
  retryDelayDescription: "Delay between title checks and transient discard retries.",
  maximumDiscardRetries: "Maximum discard retries",
  maximumDiscardRetriesDescription: "How many times a failed discard API call is retried.",
  discardConcurrency: "Discard concurrency",
  discardConcurrencyDescription: "Maximum number of discard operations in flight at once.",
  advancedIntegerRangeError: "Value must be an integer between {min} and {max}.",
  unableToLoadSettings: "Unable to load settings.",
  unableToSaveSettingsAutomatically: "Unable to save settings automatically.",
  defaultsRestored: "Defaults restored.",
  unableToRestoreDefaults: "Unable to restore defaults.",
  unableToRememberLanguage: "Unable to remember language preference.",
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
    fixHighlightedField: "请修正标记的字段。",
    minimumTabCount: "最小标签页数量",
    minimumTabCountDescription: "标签页数量不超过此值的标签组将跳过释放。",
    minimumTabCountError: "最小标签页数量必须是大于或等于 0 的整数。",
    waitForTabTitles: "等待标签页标题",
    experimental: "实验性",
    waitForTabTitlesDescription: "等待标题更新后再释放该标签页。",
    waitForTabTitlesAriaLabel: "释放前等待标签页标题",
    waitForTabTitlesWarning:
      "实验性功能：标签组打开时，标签页会更晚释放，因此可能延长高内存占用时间。",
    groupAllowlist: "标签组允许列表",
    groupAllowlistDescription: "匹配的标签组标题将跳过释放。",
    addGroupToAllowlistAriaLabel: "将标签组添加到允许列表",
    showMoreGroups: "显示更多标签组",
    showLessGroups: "收起标签组",
    allowlistedGroupTitleAriaLabel: "允许列表中的标签组标题 {index}",
    removeAllowlistedGroupAriaLabel: "移除允许列表中的标签组：{title}",
    addGroupPlaceholder: "添加标签组",
    addAllowlistedGroupAriaLabel: "添加允许列表中的标签组标题",
    duplicateGroupError: "此标签组已在允许列表中。",
    advancedSettings: "高级设置",
    advancedSettingsDescription: "微调恢复时序、重试次数和释放并发数。",
    restoreDetectionWindow: "恢复检测窗口",
    restoreDetectionWindowDescription: "新建标签页可以加入恢复批次的最长时间。",
    detectionCleanupMargin: "检测清理余量",
    detectionCleanupMarginDescription: "清理过期新建标签页跟踪记录前额外等待的时间。",
    groupInspectionDelay: "标签组检查延迟",
    groupInspectionDelayDescription: "等待恢复中的标签组完成组装的防抖时间。",
    restoreBatchLifetime: "恢复批次生命周期",
    restoreBatchLifetimeDescription: "标题等待最多可以延迟释放的时间。",
    discardStartGap: "释放启动间隔",
    discardStartGapDescription: "启动下一个释放任务前的暂停时间。",
    retryDelay: "重试延迟",
    retryDelayDescription: "标题检查和临时释放失败重试之间的延迟。",
    maximumDiscardRetries: "最大释放重试次数",
    maximumDiscardRetriesDescription: "释放 API 调用失败后的最大重试次数。",
    discardConcurrency: "释放并发数",
    discardConcurrencyDescription: "同时进行的最大释放操作数。",
    advancedIntegerRangeError: "数值必须是 {min} 到 {max} 之间的整数。",
    unableToLoadSettings: "无法加载设置。",
    unableToSaveSettingsAutomatically: "无法自动保存设置。",
    defaultsRestored: "已恢复默认设置。",
    unableToRestoreDefaults: "无法恢复默认设置。",
    unableToRememberLanguage: "无法记住语言偏好。",
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
