import { z } from "zod";
import { getNewReleases, getSeveralAlbums, searchTracks } from "@/lib/spotify";
import { createRouter } from "./context";

const requestRouter = createRouter()
  .mutation("search", {
    input: z.object({
      searchQuery: z.string(),
    }),
    async resolve({ input }) {
      const search = await searchTracks(input.searchQuery);
      const res = search.tracks.items;

      return res;
    },
  })
  .mutation("request", {
    input: z.object({
      trackId: z.string(),
      submissionId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.requestedTrack.create({
        data: {
          spotifyId: input.trackId,
          submissionId: input.submissionId,
          request_token: ctx.submissionToken,
        },
      });
    },
  })
  .query("recommendations", {
    async resolve() {
      const newReleaseAlbums = await getNewReleases();
      const albumIds = newReleaseAlbums.map((album) => album.id);
      const albumsData = await getSeveralAlbums(albumIds);

      const tracks = albumsData.map((album) => {
        return { ...album.tracks.items[0]!, album };
      });

      return { recommendations: tracks };
    },
  });

export default requestRouter;
