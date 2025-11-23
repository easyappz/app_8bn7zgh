const TOKEN_KEY = 'authToken';
const MEMBER_KEY = 'authMember';

function isStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveToken(token) {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (!isStorageAvailable()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

export function saveMember(member) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const serialized = JSON.stringify(member);
    window.localStorage.setItem(MEMBER_KEY, serialized);
  } catch (error) {
    console.error('Failed to serialize member for storage:', error);
  }
}

export function getMember() {
  if (!isStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(MEMBER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse stored member:', error);
    return null;
  }
}

export function clearMember() {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(MEMBER_KEY);
}

export function clearAuth() {
  clearToken();
  clearMember();
}
