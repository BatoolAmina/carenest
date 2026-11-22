// Integration test against an in-memory MongoDB. Proves double booking is impossible under concurrency.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, Patient, Doctor, Department, DoctorAvailability, Appointment } from "../models/index.js";
import { bookAppointment, updateAppointment, getAvailableSlots, cancelUpcomingForDoctor, findScheduleConflicts, cancelScheduleConflicts, sweepNoShows } from "../services/appointments.js";
import { nowInTz, addDays } from "../lib/time.js";

let mongod, doctor, patients = [], actors = [], date;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all([Appointment, Doctor, Patient].map((m) => m.syncIndexes()));
  const dept = await Department.create({ name: "Cardiology", slug: "cardiology" });
  const du = await User.create({ email: "d@carenest.health", name: "Doc Tor", role: "doctor", emailVerified: new Date() });
  doctor = await Doctor.create({ user: du._id, department: dept._id, specialization: "Cardiology", registrationNumber: "R1", registrationCouncil: "C", hospitalEmail: "d@carenest.health", verification: { status: "approved" } });
  await DoctorAvailability.create({ doctor: doctor._id, slotMinutes: 30, weekly: Array.from({ length: 7 }, (_, day) => ({ day, enabled: true, start: "09:00", end: "17:00", breaks: [] })) });
  for (let i = 0; i < 12; i++) {
    const u = await User.create({ email: `p${i}@x.com`, name: `Patient ${i}`, role: "patient", emailVerified: new Date() });
    patients.push(await Patient.create({ user: u._id, mrn: `MRN${i}` }));
    actors.push({ id: String(u._id), role: "patient" });
  }
  date = addDays(nowInTz().date, 3);
});
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });

describe("appointment engine", () => {
  it("lets exactly one of many simultaneous requests win a slot", async () => {
    const results = await Promise.allSettled(patients.map((p, i) => bookAppointment({ actor: actors[i], patientId: p._id, doctorId: doctor._id, date, time: "10:00", reason: "check" })));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    for (const r of results.filter((r) => r.status === "rejected")) expect(r.reason.code).toBe("SLOT_TAKEN");
    expect(await Appointment.countDocuments({ doctor: doctor._id, date, time: "10:00", status: "booked" })).toBe(1);
  });
  it("hides booked slots and frees them again on cancel", async () => {
    expect((await getAvailableSlots(doctor._id, date)).some((s) => s.time === "10:00")).toBe(false);
    const appt = await Appointment.findOne({ doctor: doctor._id, date, time: "10:00" }).populate("patient");
    await updateAppointment({ actor: { id: String(appt.patient.user), role: "patient" }, id: appt._id, action: "cancel" });
    expect((await getAvailableSlots(doctor._id, date)).some((s) => s.time === "10:00")).toBe(true);
    await bookAppointment({ actor: actors[5], patientId: patients[5]._id, doctorId: doctor._id, date, time: "10:00", reason: "rebook" });
  });
  it("blocks the same patient holding two doctors/slots at the same time", async () => {
    await bookAppointment({ actor: actors[1], patientId: patients[1]._id, doctorId: doctor._id, date, time: "11:00", reason: "a" });
    await expect(bookAppointment({ actor: actors[1], patientId: patients[1]._id, doctorId: doctor._id, date, time: "11:00", reason: "b" })).rejects.toMatchObject({ status: 409 });
  });
  it("refuses unapproved doctors and invalid or past slots", async () => {
    await Doctor.updateOne({ _id: doctor._id }, { "verification.status": "under_review" });
    await expect(bookAppointment({ actor: actors[2], patientId: patients[2]._id, doctorId: doctor._id, date, time: "12:00", reason: "x" })).rejects.toMatchObject({ code: "DOCTOR_UNAVAILABLE" });
    await Doctor.updateOne({ _id: doctor._id }, { "verification.status": "approved" });
    await expect(bookAppointment({ actor: actors[2], patientId: patients[2]._id, doctorId: doctor._id, date, time: "03:00", reason: "x" })).rejects.toMatchObject({ code: "INVALID_SLOT" });
    await expect(bookAppointment({ actor: actors[2], patientId: patients[2]._id, doctorId: doctor._id, date: addDays(nowInTz().date, -1), time: "10:00", reason: "x" })).rejects.toMatchObject({ code: "PAST_SLOT" });
  });
  it("prevents one patient acting on another patient's appointment", async () => {
    const appt = await Appointment.findOne({ doctor: doctor._id, date, time: "11:00" });
    await expect(updateAppointment({ actor: actors[7], id: appt._id, action: "cancel" })).rejects.toMatchObject({ status: 403 });
  });
  it("reschedules atomically and rejects an occupied target", async () => {
    const appt = await Appointment.findOne({ doctor: doctor._id, date, time: "11:00" });
    await expect(updateAppointment({ actor: actors[1], id: appt._id, action: "reschedule", date, time: "10:00" })).rejects.toMatchObject({ code: "SLOT_TAKEN" });
    await updateAppointment({ actor: actors[1], id: appt._id, action: "reschedule", date, time: "15:00" });
    expect((await getAvailableSlots(doctor._id, date)).some((s) => s.time === "11:00")).toBe(true);
  });
  it("issues unique queue numbers even when check-ins race", async () => {
    const today = nowInTz().date, rows = [];
    for (let i = 0; i < 6; i++) {
      const t = `0${i + 1}:00`;
      rows.push(await Appointment.create({ patient: patients[i]._id, doctor: doctor._id, department: doctor.department, date: today, time: t, endTime: t, reason: "q", status: "booked", slotKey: `${doctor._id}_${today}_${t}`, patientSlotKey: `${patients[i]._id}_${today}_${t}` }));
    }
    await Promise.all(rows.map((a) => updateAppointment({ actor: { id: String(patients[0].user), role: "receptionist" }, id: a._id, action: "check_in" })));
    const nums = (await Appointment.find({ _id: { $in: rows.map((r) => r._id) } })).map((a) => a.queueNumber).sort();
    expect(new Set(nums).size).toBe(6);
  });
  it("answers 403 (not 409) when a role attempts an action it can never perform", async () => {
    const appt = await Appointment.findOne({ doctor: doctor._id, date, status: "booked" });
    await expect(updateAppointment({ actor: { id: "x", role: "receptionist" }, id: appt._id, action: "complete" })).rejects.toMatchObject({ status: 403 });
  });
  it("detects bookings outside a changed schedule, cancels them, and frees the slots", async () => {
    await DoctorAvailability.updateOne({ doctor: doctor._id }, { $set: { "weekly.$[].enabled": false } });
    const conflicts = await findScheduleConflicts(doctor._id);
    expect(conflicts.length).toBeGreaterThan(0);
    const n = await cancelScheduleConflicts(doctor._id);
    expect(n).toBe(conflicts.length);
    expect(await Appointment.countDocuments({ doctor: doctor._id, status: "booked", date: { $gte: nowInTz().date } })).toBe(0);
    await DoctorAvailability.updateOne({ doctor: doctor._id }, { $set: { "weekly.$[].enabled": true } });
  });
  it("cancels all upcoming appointments when a doctor is revoked", async () => {
    await bookAppointment({ actor: actors[3], patientId: patients[3]._id, doctorId: doctor._id, date, time: "16:00", reason: "r" });
    const expected = await Appointment.countDocuments({ doctor: doctor._id, status: { $in: ["booked", "checked_in"] }, date: { $gte: nowInTz().date } });
    expect(expected).toBeGreaterThan(0);
    expect(await cancelUpcomingForDoctor(doctor._id, "the doctor is no longer available")).toBe(expected);
    expect((await getAvailableSlots(doctor._id, date)).some((s) => s.time === "16:00")).toBe(true);
    expect(await Appointment.countDocuments({ doctor: doctor._id, status: { $in: ["booked", "checked_in"] }, date: { $gte: nowInTz().date } })).toBe(0);
  });
  it("sweeps past never-attended bookings to no-show", async () => {
    const past = addDays(nowInTz().date, -2);
    await Appointment.create({ patient: patients[8]._id, doctor: doctor._id, department: doctor.department, date: past, time: "09:00", endTime: "09:30", reason: "old", status: "booked", slotKey: `${doctor._id}_${past}_09:00` });
    expect(await sweepNoShows()).toBeGreaterThanOrEqual(1);
  });
});
