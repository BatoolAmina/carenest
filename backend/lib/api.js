import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { connectDB } from "./db.js";
import { AppError, forbidden, notFound } from "./errors.js";
import { getSession } from "./session.js";
import { rateLimit } from "./rate-limit.js";

export const clientIp = (req) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

export function fail(e) {
  if (e instanceof ZodError) {
    const fields = {};
    for (const i of e.issues) fields[i.path.join(".") || "_"] ||= i.message;
    return NextResponse.json({ error: e.issues[0]?.message || "Invalid input", fields }, { status: 422 });
  }
  if (e instanceof AppError) return NextResponse.json({ error: e.message, code: e.code, fields: e.details }, { status: e.status });
  if (e?.code === 11000) return NextResponse.json({ error: "A record with those details already exists.", code: "DUPLICATE" }, { status: 409 });
  if (e?.name === "CastError") return NextResponse.json({ error: "Invalid identifier", code: "BAD_ID" }, { status: 400 });
  console.error("[api:error]", e);
  return NextResponse.json({ error: "Something went wrong on our side. Please try again.", code: "INTERNAL" }, { status: 500 });
}

/**
 * Wraps a route handler: DB connection, optional rate limit, same-origin check for mutations,
 * authentication + role authorization (roles come from the DB-backed session, never the client), JSON errors.
 */
export function route(handler, { roles, limit } = {}) {
  return async (req, ctx) => {
    try {
      const ip = clientIp(req);
      if (limit) rateLimit(`${limit.key || new URL(req.url).pathname}:${ip}`, limit);
      if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        const origin = req.headers.get("origin");
        if (origin && new URL(origin).host !== req.headers.get("host")) throw forbidden("Cross-site request blocked");
      }
      await connectDB();
      let user = null;
      if (roles) {
        user = (await getSession())?.user;
        if (!user) throw new AppError(401, "Please sign in to continue.", "UNAUTHENTICATED");
        if (!roles.includes(user.role)) throw forbidden();
      }
      const params = (await ctx?.params) || {};
      const out = await handler({ req, params, user, ip });
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) { return fail(e); }
  };
}

export async function body(req, schema) {
  let json;
  try { json = await req.json(); } catch { throw new AppError(400, "Invalid request body", "BAD_JSON"); }
  return schema.parse(json);
}
export const assertId = (id, what = "Resource") => { if (!mongoose.isValidObjectId(id)) throw notFound(what); return id; };
