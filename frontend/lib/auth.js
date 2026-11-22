export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (token?.expired) return { ...session, user: undefined, expires: new Date(0).toISOString() };
      if (token?.uid) session.user = { id: token.uid, role: token.role, name: token.name, email: token.email, image: token.picture };
      return session;
    },
  },
};
