import { createRequire } from "node:module";
import { authOptions } from "@/lib/auth.js";
const require = createRequire(import.meta.url);
const NextAuthModule = require("next-auth");
const NextAuth = NextAuthModule.default || NextAuthModule;
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export const dynamic = "force-dynamic";
