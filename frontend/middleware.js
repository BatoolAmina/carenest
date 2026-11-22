import { withAuth } from "next-auth/middleware";
// First line of defence for portal pages. Every API route and portal layout re-checks the role against the database.
const PREFIX = { "/admin": "admin", "/doctor": "doctor", "/reception": "receptionist", "/patient": "patient" };
export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token || token.expired) return false;
      const p = req.nextUrl.pathname;
      const hit = Object.keys(PREFIX).find((k) => p === k || p.startsWith(k + "/"));
      return hit ? token.role === PREFIX[hit] : true;
    },
  },
});
export const config = { matcher: ["/admin/:path*", "/doctor/:path*", "/reception/:path*", "/patient/:path*"] };
