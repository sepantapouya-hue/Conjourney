// Generates a stable identity for this browser (name + color) so a user
// keeps the same avatar across reloads.

const ADJECTIVES = [
  "Quick", "Bright", "Curious", "Quiet", "Brave", "Calm", "Clever", "Wild",
  "Sunny", "Lucky", "Bold", "Witty", "Sharp", "Sleek", "Cosmic", "Lively",
];
const ANIMALS = [
  "Otter", "Fox", "Heron", "Lynx", "Wren", "Bison", "Falcon", "Marten",
  "Pika", "Tapir", "Ibis", "Koala", "Gecko", "Quokka", "Crane", "Yak",
];
const COLORS = [
  "#7d71fe", "#ff9179", "#0d9488", "#e11d48", "#2563eb", "#a855f7",
  "#16a34a", "#f59e0b", "#0ea5e9", "#db2777", "#65a30d", "#f97316",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const KEY = "conjourney_identity_v1";

export function getIdentity() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name && parsed?.color) return parsed;
    }
  } catch {
    /* ignore */
  }
  const identity = {
    name: `${pick(ADJECTIVES)} ${pick(ANIMALS)}`,
    color: pick(COLORS),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(identity));
  } catch {
    /* ignore */
  }
  return identity;
}

export function setIdentity(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
