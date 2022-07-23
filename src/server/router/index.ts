// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import submissionRouter from "./submission";
import requestRouter from "./request";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("submission.", submissionRouter)
  .merge("request.", requestRouter);
 
 

// export type definition of API
export type AppRouter = typeof appRouter;
