const STORAGE_KEY = "txn_line_column_prefs";

type PrefsEntry = { selected: string[]; known: string[] };
type PrefsStore = Record<string, PrefsEntry | string[]>;

export interface ColumnPrefs {
  selected: string[];
  known: string[];
}

export function loadColumnPrefs(transactionKey: string): ColumnPrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as PrefsStore;
    const entry = store[transactionKey];
    if (!entry) return null;
    // backward compat: old format was plain string[]
    if (Array.isArray(entry)) return { selected: entry, known: entry };
    return entry as ColumnPrefs;
  } catch {
    return null;
  }
}

export function saveColumnPrefs(transactionKey: string, selected: string[], allKeys: string[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store: PrefsStore = raw ? (JSON.parse(raw) as PrefsStore) : {};
    store[transactionKey] = { selected, known: allKeys };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore write errors (storage full, private browsing, etc.)
  }
}
