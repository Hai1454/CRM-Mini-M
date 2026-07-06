export const CRM_DATA_CHANGED_EVENT = "crm:data-changed";
export const CRM_DATA_CHANGED_STORAGE_KEY = "crm-data-changed";

export function notifyCrmDataChanged(scope = "all") {
  const detail = { scope, at: Date.now() };
  window.dispatchEvent(new CustomEvent(CRM_DATA_CHANGED_EVENT, { detail }));

  try {
    window.localStorage.setItem(CRM_DATA_CHANGED_STORAGE_KEY, JSON.stringify(detail));
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
}
