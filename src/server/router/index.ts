// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import submissionRouter from "./submission";
import requestRouter from "./request";
import { spotifyPlayerRouter } from "./spotify-player";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("submission.", submissionRouter)
  .merge("request.", requestRouter)
  .merge("player.", spotifyPlayerRouter);
 
 

// export type definition of API
export type AppRouter = typeof appRouter;
