import { describe, it, expect } from "vitest";
import { generateSlots, dayOfWeek, addDays, minutesUntil, isPastSlot, nowInTz } from "../lib/time.js";
const weekly = Array.from({ length: 7 }, (_, day) => ({ day, enabled: day >= 1 && day <= 5, start: "09:00", end: "12:00", breaks: [{ start: "10:00", end: "10:30" }] }));
describe("slot generation", () => {
  it("excludes breaks and respects slot length", () => {
    const s = generateSlots({ weekly, slotMinutes: 30, date: "2026-11-16" }); // Monday
    expect(s.map((x) => x.time)).toEqual(["09:00", "09:30", "10:30", "11:00", "11:30"]);
  });
  it("returns nothing on disabled weekdays and days off", () => {
    expect(generateSlots({ weekly, date: "2026-11-15" })).toEqual([]);
    expect(generateSlots({ weekly, date: "2026-11-16", daysOff: [{ date: "2026-11-16" }] })).toEqual([]);
  });
  it("never emits a slot that overruns the shift", () => {
    const s = generateSlots({ weekly: [{ day: 1, enabled: true, start: "09:00", end: "09:50", breaks: [] }], slotMinutes: 30, date: "2026-11-16" });
    expect(s).toHaveLength(1);
  });
});
describe("date helpers", () => {
  it("computes weekday and date arithmetic", () => { expect(dayOfWeek("2026-11-14")).toBe(6); expect(addDays("2026-12-31", 1)).toBe("2027-01-01"); });
  it("compares against hospital-local time", () => {
    const at = new Date("2026-11-14T06:30:00Z"); // 12:00 in Asia/Kolkata
    expect(nowInTz("Asia/Kolkata", at)).toEqual({ date: "2026-11-14", time: "12:00" });
    expect(minutesUntil("2026-11-14", "13:00", "Asia/Kolkata", at)).toBe(60);
    expect(isPastSlot("2026-11-14", "11:30", "Asia/Kolkata", at)).toBe(true);
  });
});
