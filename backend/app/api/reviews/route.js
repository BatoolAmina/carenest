import { route, body } from "@/lib/api.js";
import { reviewSchema } from "@/lib/validators.js";
import { AppError, forbidden } from "@/lib/errors.js";
import { Appointment, Patient, Review } from "@/models/index.js";
import { recalcRating } from "@/services/reviews.js";
export const POST = route(async ({ req, user }) => {
  const data = await body(req, reviewSchema);
  const patient = await Patient.findOne({ user: user.id }).select("_id");
  const appt = await Appointment.findById(data.appointmentId);
  if (!appt || String(appt.patient) !== String(patient._id)) throw forbidden();
  if (appt.status !== "completed") throw new AppError(409, "You can review a doctor after your appointment is completed.", "NOT_COMPLETED");
  if (await Review.exists({ appointment: appt._id })) throw new AppError(409, "You have already reviewed this visit.", "DUPLICATE");
  await Review.create({ patient: patient._id, doctor: appt.doctor, appointment: appt._id, rating: data.rating, comment: data.comment }); // unique per appointment
  await recalcRating(appt.doctor);
  return { ok: true };
}, { roles: ["patient"], limit: { limit: 10, windowMs: 3600_000 } });

export const dynamic = "force-dynamic";
