import { NextResponse } from "next/server";
import { route } from "@/lib/api.js";
import { getHomeData } from "@/services/public.js";

export const GET = route(async () => ({ ...await getHomeData(), ok: true }));

export const dynamic = "force-dynamic";
