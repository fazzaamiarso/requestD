// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import submissionRouter from "./submission";
import { z } from "zod";
import { searchTracks } from "../../lib/spotify";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("submission.", submissionRouter)
  .mutation("search", {
    input: z.object({
      searchQuery: z.string(),
    }),
    async resolve({ ctx, input }) {
      const search = await searchTracks(input.searchQuery);
      const res = search.tracks.items;

      return res;
    },
  });
 

// export type definition of API
export type AppRouter = typeof appRouter;
