import { z } from "zod";
import {
  getNewReleases,
  getPlaylistDetail,
  getPublicUserProfile,
  getSeveralAlbums,
  searchTracks,
} from "@/lib/spotify";
import { createRouter } from "./context";
import { dayjs } from "@/lib/dayjs";

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
      if (!ctx.submissionToken) throw Error("Submission Token must be set");
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
  })
  .query("owner", {
    input: z.object({ spotifyUserId: z.string() }),
    async resolve({ input }) {
      const profile = await getPublicUserProfile(input.spotifyUserId);
      return profile;
    },
  })
  .query("submission", {
    input: z.object({ submissionId: z.string() }),
    async resolve({ ctx, input }) {
      let submission = await ctx.prisma.submission.findFirst({
        where: { id: input.submissionId },
      });
      if (!submission) return null;

      const shouldEnd =
        dayjs().isAfter(submission.endsAt) && submission.status !== "ENDED";
      if (shouldEnd) {
        submission = await ctx.prisma.submission.update({
          where: { id: input.submissionId },
          data: { status: "ENDED" },
        });
      }
      return submission;
    },
  })
  .query("playlist", {
    input: z.object({ playlistId: z.string(), submissionId: z.string() }),
    async resolve({ ctx, input }) {
      const playlistDetail = await getPlaylistDetail(input.playlistId);
      if (!playlistDetail) {
        await ctx.prisma.submission.delete({
          where: { id: input.submissionId },
        });
        return null;
      }
      return playlistDetail;
    },
  })
  .query("request-count", {
    input: z.object({ submissionId: z.string(), request_token: z.string() }),
    async resolve({ ctx, input }) {
      const requestCount = await ctx.prisma.requestedTrack.count({
        where: {
          submissionId: input.submissionId,
          request_token: input.request_token,
        },
      });
      return requestCount;
    },
  });

export default requestRouter;
