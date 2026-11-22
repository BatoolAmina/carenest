import { describe, it, expect } from "vitest";
import { roleMayAction, canAppointmentAction, decideRecordAccess, canWriteRecordType, canAdminReview, canDoctorSubmit } from "../lib/policy.js";
describe("appointment action policy", () => {
  it("lets patients cancel only their own booked appointments", () => {
    expect(canAppointmentAction({ role: "patient", isOwner: true, action: "cancel", status: "booked" })).toBe(true);
    expect(canAppointmentAction({ role: "patient", isOwner: false, action: "cancel", status: "booked" })).toBe(false);
    expect(canAppointmentAction({ role: "patient", isOwner: true, action: "cancel", status: "completed" })).toBe(false);
  });
  it("restricts check-in to staff and completion to the treating doctor", () => {
    expect(canAppointmentAction({ role: "patient", isOwner: true, action: "check_in", status: "booked" })).toBe(false);
    expect(canAppointmentAction({ role: "receptionist", action: "check_in", status: "booked" })).toBe(true);
    expect(canAppointmentAction({ role: "receptionist", action: "complete", status: "checked_in" })).toBe(false);
    expect(canAppointmentAction({ role: "doctor", isOwner: true, action: "complete", status: "checked_in" })).toBe(true);
    expect(canAppointmentAction({ role: "doctor", isOwner: false, action: "complete", status: "checked_in" })).toBe(false);
  });
});
describe("medical record access", () => {
  it("allows owner patient and related approved doctor only", () => {
    expect(decideRecordAccess({ role: "patient", isOwner: true })).toBe(true);
    expect(decideRecordAccess({ role: "patient", isOwner: false })).toBe(false);
    expect(decideRecordAccess({ role: "doctor", doctorApproved: true, hasRelationship: true })).toBe(true);
    expect(decideRecordAccess({ role: "doctor", doctorApproved: true, hasRelationship: false })).toBe(false);
    expect(decideRecordAccess({ role: "doctor", doctorApproved: false, hasRelationship: true })).toBe(false);
  });
  it("never grants clinical access to reception or admin", () => {
    for (const role of ["receptionist", "admin"]) expect(decideRecordAccess({ role, isOwner: true, doctorApproved: true, hasRelationship: true })).toBe(false);
  });
  it("limits what patients may write", () => {
    expect(canWriteRecordType({ role: "patient", type: "allergy", isOwner: true })).toBe(true);
    expect(canWriteRecordType({ role: "patient", type: "diagnosis", isOwner: true })).toBe(false);
    expect(canWriteRecordType({ role: "receptionist", type: "history" })).toBe(false);
  });
});
describe("doctor verification state machine", () => {
  it("only lets admins approve applications under review", () => {
    expect(canAdminReview("under_review", "approve")).toBe(true);
    for (const s of ["email_unverified", "documents_pending", "changes_requested", "rejected", "approved"]) expect(canAdminReview(s, "approve")).toBe(false);
  });
  it("only lets doctors submit when documents are pending or corrections requested", () => {
    expect(canDoctorSubmit("documents_pending")).toBe(true); expect(canDoctorSubmit("changes_requested")).toBe(true);
    for (const s of ["email_unverified", "under_review", "approved", "rejected"]) expect(canDoctorSubmit(s)).toBe(false);
  });
});

describe("role-level action permissions", () => {
  it("rejects actions a role can never perform (so the API answers 403, not 409)", () => {
    expect(roleMayAction("receptionist", "complete")).toBe(false);
    expect(roleMayAction("patient", "check_in")).toBe(false);
    expect(roleMayAction("doctor", "reschedule")).toBe(false);
    expect(roleMayAction("receptionist", "check_in")).toBe(true);
  });
});
