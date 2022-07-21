// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import submissionRouter from "./submission";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("submission.", submissionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
