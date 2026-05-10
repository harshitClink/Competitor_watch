const DEFAULT_BASE = "https://competitivewatchagent.onrender.com";

export function getApiBaseUrl() {
  const raw =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

const PILOT_STORAGE_KEY = "clink_pilot_restaurant_id";

export function getStoredPilotRestaurantId() {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(PILOT_STORAGE_KEY);
  if (v == null || v === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function setStoredPilotRestaurantId(id) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PILOT_STORAGE_KEY, String(id));
}

export function clearStoredPilotRestaurantId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PILOT_STORAGE_KEY);
}

const CHAT_SESSION_KEY = "clink_chat_session_id";

export function getStoredChatSessionId() {
  if (typeof window === "undefined") return null;
  const v = window.sessionStorage.getItem(CHAT_SESSION_KEY);
  if (v == null || v === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function setStoredChatSessionId(id) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CHAT_SESSION_KEY, String(id));
}

export function clearStoredChatSessionId() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHAT_SESSION_KEY);
}

/**
 * @param {string} path - e.g. "/restaurants/search?q=foo"
 * @param {RequestInit} [options]
 */
export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}/api${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const pilotId = getStoredPilotRestaurantId();
  if (pilotId != null) {
    headers.set("X-Pilot-Restaurant-Id", String(pilotId));
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  /** @type {any} */
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      data?.error?.message ||
      (typeof text === "string" && text) ||
      res.statusText ||
      "Request failed";
    const err = new Error(msg);
    err.code = data?.error?.code;
    err.status = res.status;
    err.detail = data?.error?.detail;
    throw err;
  }
  return data;
}

export function searchRestaurants(q, limit = 10) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return apiFetch(`/restaurants/search?${params}`);
}

export function setPilotRestaurant(restaurantId) {
  return apiFetch("/pilot_restaurants", {
    method: "POST",
    body: JSON.stringify({ restaurant_id: restaurantId }),
  });
}

export function getCurrentPilot() {
  return apiFetch("/pilot_restaurants/current");
}

export function listPilots() {
  return apiFetch("/pilot_restaurants");
}

export function getPilot(id) {
  return apiFetch(`/pilot_restaurants/${id}`);
}

export function getSuggestedCompetitors(pilotId, limit = 12) {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiFetch(`/pilot_restaurants/${pilotId}/suggested_competitors?${params}`);
}

export function createCompetitorSet(body) {
  return apiFetch("/competitor_sets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listCompetitorSets(pilotRestaurantId) {
  const params = new URLSearchParams({
    pilot_restaurant_id: String(pilotRestaurantId),
  });
  return apiFetch(`/competitor_sets?${params}`);
}

export function getCompetitorSet(id) {
  return apiFetch(`/competitor_sets/${id}`);
}

export function addCompetitorSetMember(setId, restaurantId, source = "manual") {
  return apiFetch(`/competitor_sets/${setId}/members`, {
    method: "POST",
    body: JSON.stringify({ restaurant_id: restaurantId, source }),
  });
}

export function removeCompetitorSetMember(setId, memberId) {
  return apiFetch(`/competitor_sets/${setId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export function getDailyDigest(pilotId, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const q = params.toString();
  return apiFetch(
    `/pilot_restaurants/${pilotId}/daily_digest${q ? `?${q}` : ""}`,
  );
}

export function listDailyDigests(pilotId, from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch(
    `/pilot_restaurants/${pilotId}/daily_digests?${params.toString()}`,
  );
}

export function getLeaderboard(setId, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const q = params.toString();
  return apiFetch(`/competitor_sets/${setId}/leaderboard${q ? `?${q}` : ""}`);
}

export function getLeaderboardHistory(setId, from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch(
    `/competitor_sets/${setId}/leaderboard/history?${params.toString()}`,
  );
}

export function getThreatAssessments(pilotId) {
  return apiFetch(`/pilot_restaurants/${pilotId}/threat_assessments`);
}

export function getRestaurant(id) {
  return apiFetch(`/restaurants/${id}`);
}

export function getRestaurantMenu(id, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const q = params.toString();
  return apiFetch(`/restaurants/${id}/menu${q ? `?${q}` : ""}`);
}

export function getMenuChanges(id, since = "30d") {
  const params = new URLSearchParams({ since });
  return apiFetch(`/restaurants/${id}/menu_changes?${params}`);
}

export function getRatingTrend(id, from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch(`/restaurants/${id}/rating_trend?${params.toString()}`);
}

export function getPricingAnalysis(id, compareTo) {
  const params = new URLSearchParams();
  if (compareTo != null) params.set("compare_to", String(compareTo));
  return apiFetch(`/restaurants/${id}/pricing_analysis?${params.toString()}`);
}

export function getActivityFeed(id, since = "14d", types) {
  const params = new URLSearchParams({ since });
  if (types) params.set("types", types);
  return apiFetch(`/restaurants/${id}/activity_feed?${params.toString()}`);
}

export function getSocialSignals(id, since = "14d") {
  const params = new URLSearchParams({ since });
  return apiFetch(`/restaurants/${id}/social_signals?${params.toString()}`);
}

export function getSerpPresence(id, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const q = params.toString();
  return apiFetch(`/restaurants/${id}/serp_presence${q ? `?${q}` : ""}`);
}

export function getGoogleReviews(id, since = "7d", limit = 20) {
  const params = new URLSearchParams({
    since,
    limit: String(limit),
  });
  return apiFetch(`/restaurants/${id}/google_reviews?${params}`);
}

export function createChatSession(pilotRestaurantId, title) {
  const body = { pilot_restaurant_id: pilotRestaurantId };
  if (title) body.title = title;
  return apiFetch("/chat_sessions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listChatSessions(pilotRestaurantId) {
  const params = new URLSearchParams({
    pilot_restaurant_id: String(pilotRestaurantId),
  });
  return apiFetch(`/chat_sessions?${params}`);
}

export function getChatSession(id) {
  return apiFetch(`/chat_sessions/${id}`);
}

export function getChatMessages(sessionId, includeTrace) {
  const params = new URLSearchParams();
  if (includeTrace) params.set("include", "trace");
  const q = params.toString();
  return apiFetch(`/chat_sessions/${sessionId}/messages${q ? `?${q}` : ""}`);
}

export function sendChatMessage(sessionId, content, includeTrace) {
  const params = new URLSearchParams();
  if (includeTrace) params.set("include", "trace");
  const q = params.toString();
  return apiFetch(`/chat_sessions/${sessionId}/messages${q ? `?${q}` : ""}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
