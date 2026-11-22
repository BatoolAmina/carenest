import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectDB } from "@/lib/db.js";
import { Appointment } from "@/models/index.js";
import { nowInTz, addDays, minutesUntil } from "@/lib/time.js";
import { notifyUser } from "@/services/notifications.js";
import { sweepNoShows } from "@/services/appointments.js";
import { fail } from "@/lib/api.js";

// Called by Vercel Cron (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
export async function GET(req) {
  try {
    const secret = process.env.CRON_SECRET;
    const given = req.headers.get("authorization") || "";
    const expected = `Bearer ${secret}`;
    const ok = secret && given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const today = nowInTz().date;
    const due = await Appointment.find({ status: "booked", reminderSent: false, date: { $in: [today, addDays(today, 1)] } }).populate({ path: "patient", select: "user" }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } });
    let sent = 0;
    for (const a of due) {
      const mins = minutesUntil(a.date, a.time);
      if (mins <= 0 || mins > 24 * 60) continue;
      const claimed = await Appointment.updateOne({ _id: a._id, reminderSent: false }, { reminderSent: true }); // claim first so overlapping runs never double-send
      if (!claimed.modifiedCount) continue;
      await notifyUser(a.patient.user, { type: "reminder", title: "Appointment reminder", body: `You have an appointment with Dr. ${a.doctor.user.name} on ${a.date} at ${a.time}.`, link: "/patient/appointments" });
      sent++;
    }
    const noShows = await sweepNoShows(); // past bookings that were never checked in
    return NextResponse.json({ ok: true, sent, noShows });
  } catch (e) { return fail(e); }
}

export const dynamic = "force-dynamic";
