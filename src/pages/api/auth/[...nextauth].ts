import NextAuth, { type NextAuthOptions, DefaultSession } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../server/env.mjs";

const spotifyAuthScopes = [
  "user-read-email",
  "playlist-modify-public",
  "user-modify-playback-state",
  "user-read-private",
  "user-read-playback-state",
];

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        token.user = user;
      }
      if (account) {
        token.access_token = account?.refresh_token;
      }
      return token;
    },
    session({ session, token }) {
      session.user = token.user as any;
      session.access_token = token.access_token;
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      authorization: `https://accounts.spotify.com/authorize?scope=${spotifyAuthScopes.join(
        " "
      )}`,
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);

declare module "next-auth" {
  interface Session {
    expires: DefaultSession["expires"];
    access_token: string;
  }
}
