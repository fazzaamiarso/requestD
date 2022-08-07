// src/server/router/context.ts
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession as getServerSession } from "next-auth";

import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";
import { prisma } from "../db/client";

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions,
) => {
  const req = opts?.req;
  const res = opts?.res;

  const session =
    req && res && (await getServerSession(req, res, nextAuthOptions));

  const submissionToken = req?.cookies["submission-token"];
  return {
    req,
    res,
    session,
    prisma,
    submissionToken,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
export const createProtectedRouter = () =>
  createRouter().middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session?.user?.id || !ctx.session.access_token)
      throw Error("Session and token must be set to access this route");
    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          user: { ...ctx.session.user, id: ctx.session.user.id },
        },
      },
    });
  });