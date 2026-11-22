export class AppError extends Error {
  constructor(status, message, code = "ERROR", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
export const notFound = (what = "Resource") => new AppError(404, `${what} not found`, "NOT_FOUND");
export const forbidden = (msg = "You do not have permission to do that") => new AppError(403, msg, "FORBIDDEN");
