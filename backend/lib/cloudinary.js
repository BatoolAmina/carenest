import crypto from "node:crypto";
import { AppError } from "./errors.js";

export const cloudinaryConfigured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/** Signed image upload via Cloudinary's REST API (no SDK needed). Returns a face-cropped 400×400 delivery URL. */
export async function uploadAvatar(buffer, mime, publicId) {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: "carenest/avatars", overwrite: "true", public_id: publicId, timestamp };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(toSign + secret).digest("hex");
  const form = new FormData();
  form.append("file", `data:${mime};base64,${buffer.toString("base64")}`);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", key); form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) throw new AppError(502, "Image storage rejected the upload. Please try again.", "UPLOAD_FAILED");
  return json.secure_url.replace("/upload/", "/upload/c_fill,g_face,w_400,h_400,q_auto,f_auto/");
}
