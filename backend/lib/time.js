// Pure date/time helpers. Appointments are stored as local hospital "YYYY-MM-DD" + "HH:mm" strings,
// which avoids timezone drift: a slot is the same slot for everyone.
export const HOSPITAL_TZ = process.env.HOSPITAL_TZ || "Asia/Kolkata";

export const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
export const fromMinutes = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export const addMinutes = (hhmm, n) => fromMinutes(toMinutes(hhmm) + n);

export function dayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function nowInTz(tz = HOSPITAL_TZ, at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(at).map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
const naive = (date, time) => { const [y, m, d] = date.split("-").map(Number); const [h, mi] = time.split(":").map(Number); return Date.UTC(y, m - 1, d, h, mi) / 60000; };
export function minutesUntil(date, time, tz = HOSPITAL_TZ, at = new Date()) {
  const n = nowInTz(tz, at);
  return naive(date, time) - naive(n.date, n.time);
}
export const isPastSlot = (date, time, tz, at) => minutesUntil(date, time, tz, at) <= 0;

/** weekly: [{day:0-6, enabled, start, end, breaks:[{start,end}]}] */
export function generateSlots({ weekly = [], slotMinutes = 30, daysOff = [], date }) {
  if (daysOff.some((d) => (d.date || d) === date)) return [];
  const rule = weekly.find((w) => w.day === dayOfWeek(date));
  if (!rule || !rule.enabled) return [];
  const slots = [];
  const end = toMinutes(rule.end);
  for (let t = toMinutes(rule.start); t + slotMinutes <= end; t += slotMinutes) {
    const s = t, e = t + slotMinutes;
    const inBreak = (rule.breaks || []).some((b) => s < toMinutes(b.end) && e > toMinutes(b.start));
    if (!inBreak) slots.push({ time: fromMinutes(s), endTime: fromMinutes(e) });
  }
  return slots;
}
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
