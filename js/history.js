const HISTORY_KEY = 'imamalergiju:history';
const HISTORY_LIMIT = 200;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveHistory(entries) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

// entry: { barcode, name, level, matchedNames, profileName }
function addHistoryEntry(entry) {
  const entries = loadHistory();
  entries.unshift({
    id: 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: Date.now(),
    ...entry
  });
  if (entries.length > HISTORY_LIMIT) entries.length = HISTORY_LIMIT;
  saveHistory(entries);
  return entries;
}

function deleteHistoryEntry(id) {
  const entries = loadHistory().filter((e) => e.id !== id);
  saveHistory(entries);
  return entries;
}

function clearHistory() {
  saveHistory([]);
}
