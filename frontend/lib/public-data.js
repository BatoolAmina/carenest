function backendUrl(path) {
  const base = process.env.RENDER_API_URL || "http://localhost:3002";
  return `${base.replace(/\/$/, "")}${path}`;
}

async function fetchJson(path, fallback) {
  try {
    const res = await fetch(backendUrl(path), { cache: "no-store" });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export async function getHomeData() {
  const data = await fetchJson("/api/public/home", null);
  if (!data) return { departments: [], doctors: [], reviews: [], stats: { patients: 0, doctors: 0, departments: 0 }, offline: true };
  return data;
}

export async function getDepartments() {
  const data = await fetchJson("/api/departments", { departments: [] });
  return data.departments || [];
}

export async function getPublicDoctor(id) {
  return fetchJson(`/api/doctors/${id}`, null);
}
