const STORAGE_KEY = "txn_line_column_prefs";

type PrefsStore = Record<string, string[]>;

export function loadColumnPrefs(transactionKey: string): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as PrefsStore;
    return store[transactionKey] ?? null;
  } catch {
    return null;
  }
}

export function saveColumnPrefs(transactionKey: string, columns: string[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store: PrefsStore = raw ? (JSON.parse(raw) as PrefsStore) : {};
    store[transactionKey] = columns;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore write errors (storage full, private browsing, etc.)
  }
}
