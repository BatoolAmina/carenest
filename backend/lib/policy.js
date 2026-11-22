// Pure authorization policy – easy to unit test, used by services and route handlers.
const ACTIONS = {
  patient: { owner: true, actions: ["cancel", "reschedule"] },
  doctor: { owner: true, actions: ["complete", "no_show", "cancel"] },
  receptionist: { owner: false, actions: ["cancel", "reschedule", "check_in", "no_show"] },
  admin: { owner: false, actions: ["cancel", "reschedule", "check_in", "no_show"] },
};
const FROM_STATUS = {
  cancel: ["booked", "checked_in"], reschedule: ["booked"], check_in: ["booked"],
  complete: ["booked", "checked_in"], no_show: ["booked", "checked_in"],
};
export const roleMayAction = (role, action) => !!ACTIONS[role]?.actions.includes(action);
export function canAppointmentAction({ role, isOwner, action, status }) {
  const rule = ACTIONS[role];
  if (!rule || !rule.actions.includes(action)) return false;
  if (rule.owner && !isOwner) return false;
  return (FROM_STATUS[action] || []).includes(status);
}

/** Clinical record read access. Receptionists and admins never get clinical content by default. */
export function decideRecordAccess({ role, isOwner, doctorApproved, hasRelationship }) {
  if (role === "patient") return !!isOwner;
  if (role === "doctor") return !!doctorApproved && !!hasRelationship;
  return false;
}
export const PATIENT_WRITABLE_TYPES = ["history", "allergy", "medication", "report"];
export const DOCTOR_WRITABLE_TYPES = ["history", "allergy", "medication", "diagnosis", "consultation_note", "report"];
export function canWriteRecordType({ role, type, isOwner }) {
  if (role === "patient") return !!isOwner && PATIENT_WRITABLE_TYPES.includes(type);
  if (role === "doctor") return DOCTOR_WRITABLE_TYPES.includes(type);
  return false;
}
export const DOCTOR_STATUSES = ["email_unverified", "documents_pending", "under_review", "changes_requested", "approved", "rejected"];
export const canDoctorSubmit = (status) => ["documents_pending", "changes_requested"].includes(status);
const REVIEW_FROM = { approve: ["under_review"], reject: ["under_review", "approved"], request_changes: ["under_review", "approved", "rejected"] };
export const canAdminReview = (status, action) => (REVIEW_FROM[action] || []).includes(status);
