const KEY = "miles-moments:v1";
const empty = () => ({
  version: 1,
  users: [],
  bookings: [],
  reviews: [],
  itineraries: {},
  messages: [],
  packages: {},
});
let state;
let storageError = "";
try {
  const raw = localStorage.getItem(KEY);
  state = raw ? JSON.parse(raw) : empty();
  if (
    !state ||
    state.version !== 1 ||
    !["users", "bookings", "reviews", "messages"].every(
      (k) =>
        Array.isArray(state[k]) &&
        state[k].every((x) => x && typeof x === "object"),
    ) ||
    !state.packages ||
    Array.isArray(state.packages) ||
    typeof state.packages !== "object" ||
    !state.itineraries ||
    Array.isArray(state.itineraries) ||
    typeof state.itineraries !== "object"
  )
    throw new Error("Invalid saved data");
} catch {
  state = empty();
  storageError =
    "Saved demo data could not be read. You can use a temporary session or reset local demo data.";
}
export const getState = () => structuredClone(state);
export const storageStatus = () => storageError;
export function updateState(fn) {
  const next = structuredClone(state);
  fn(next);
  if (storageError)
    throw new Error(
      "Storage is unavailable. Use “Reset demo storage” before saving.",
    );
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    state = next;
  } catch {
    storageError =
      "Browser storage is full or unavailable. Your changes were not saved.";
    throw new Error(storageError);
  }
}
export function resetStorage() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem("mm-session");
    location.reload();
  } catch {
    throw new Error(
      "Your browser is blocking storage. Enable storage for localhost, then reload to save demo data.",
    );
  }
}
export const uid = () => crypto.randomUUID();
export function currentUser() {
  try {
    return (
      state.users.find(
        (u) => u.id === sessionStorage.getItem("mm-session") && u.active,
      ) || null
    );
  } catch {
    return null;
  }
}
export async function passwordHash(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function register(name, email, password, role = "traveler") {
  email = email.trim().toLowerCase();
  name = name.trim();
  if (name.length < 2 || name.length > 60)
    throw new Error("Please enter a name of 2–60 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Please enter a valid email address.");
  if (password.length < 8)
    throw new Error("Use at least 8 characters for your demo password.");
  if (state.users.some((u) => u.email === email))
    throw new Error("This email already has an account. Please sign in.");
  const salt = uid();
  const digest = await passwordHash(password, salt);
  const user = {
    id: uid(),
    name,
    email,
    salt,
    digest,
    role,
    active: true,
    created: new Date().toISOString(),
  };
  updateState((s) => s.users.push(user));
  return user;
}
export async function login(email, password) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || (await passwordHash(password, user.salt)) !== user.digest)
    throw new Error("Email or password is incorrect.");
  if (!user.active)
    throw new Error(
      "This demo account is inactive. Contact the demo administrator.",
    );
  sessionStorage.setItem("mm-session", user.id);
  return user;
}
export async function seedDemo() {
  if (storageError) return;
  for (const [name, email, password, role] of [
    ["Alex Traveler", "traveler@miles.test", "Travel123!", "traveler"],
    ["Miles Admin", "admin@miles.test", "Admin123!", "admin"],
  ]) {
    if (!state.users.some((u) => u.email === email))
      await register(name, email, password, role);
  }
}
export function logout() {
  sessionStorage.removeItem("mm-session");
  location.href = "login.html";
}
