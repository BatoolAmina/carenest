import { route } from "@/lib/api.js";
import { AppError } from "@/lib/errors.js";
import { detectFileType, sanitizeFilename } from "@/lib/files.js";
import { cloudinaryConfigured, uploadAvatar } from "@/lib/cloudinary.js";
import { UploadedDocument, User } from "@/models/index.js";

const MAX = 2 * 1024 * 1024;
const ALL = ["patient", "doctor", "receptionist", "admin"];
export const POST = route(async ({ req, user }) => {
  const file = (await req.formData()).get("file");
  if (!file || typeof file === "string") throw new AppError(422, "Choose an image.", "VALIDATION");
  if (file.size > MAX) throw new AppError(413, "Photos must be 2 MB or smaller.", "TOO_LARGE");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(buf);
  if (!type || !type.mime.startsWith("image/")) throw new AppError(415, "Use a PNG, JPG or WebP image.", "BAD_TYPE");
  let image;
  if (cloudinaryConfigured()) image = await uploadAvatar(buf, type.mime, user.id);
  else { // fallback storage in MongoDB, served by /api/avatars/:id
    await UploadedDocument.deleteMany({ owner: user.id, kind: "avatar" });
    const doc = await UploadedDocument.create({ owner: user.id, kind: "avatar", filename: sanitizeFilename(file.name), mime: type.mime, size: buf.length, data: buf });
    image = `/api/avatars/${doc._id}`;
  }
  await User.updateOne({ _id: user.id }, { image });
  return { image };
}, { roles: ALL, limit: { limit: 10, windowMs: 3600_000 } });
export const DELETE = route(async ({ user }) => {
  await UploadedDocument.deleteMany({ owner: user.id, kind: "avatar" });
  await User.updateOne({ _id: user.id }, { image: "" });
  return { ok: true };
}, { roles: ALL });
export const dynamic = "force-dynamic";
