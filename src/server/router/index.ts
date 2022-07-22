// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import submissionRouter from "./submission";
import { createPlaylist, getUsersPlaylists } from "../../lib/spotify";
import { z } from "zod";

const myPlaylistSchema = z.object({
  items: z.array(z.any()),
  href: z.string(),
  limit: z.number(),
  next: z.string().nullable(),
  offset: z.number(),
  previous: z.string().nullable(),
  total: z.number(),
});

type SpotifyPlaylist = z.infer<typeof myPlaylistSchema>;

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("submission.", submissionRouter);
 

// export type definition of API
export type AppRouter = typeof appRouter;
