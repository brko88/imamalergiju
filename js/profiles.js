const PROFILES_KEY = 'imamalergiju:profiles';
const ACTIVE_KEY = 'imamalergiju:activeProfileId';

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_KEY);
}

function setActiveProfileId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

function getActiveProfile() {
  const id = getActiveProfileId();
  if (!id) return null;
  return loadProfiles().find((p) => p.id === id) || null;
}

function createProfileId() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// profile: { id, name, allergenIds: [] }
function upsertProfile(profile) {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) profiles[idx] = profile;
  else profiles.push(profile);
  saveProfiles(profiles);
  return profiles;
}

function deleteProfile(id) {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  saveProfiles(profiles);
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
  }
  return profiles;
}
