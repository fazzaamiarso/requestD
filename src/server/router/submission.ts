import { z } from "zod";
import {
  createPlaylist,
  getPlaylistDetail,
  getSeveralTracks,
} from "../../lib/spotify";
import { createProtectedRouter } from "./context";

const submissionRouter = createProtectedRouter()
  .query("all", {
    async resolve({ ctx }) {
      const submission = await ctx.prisma.submission.findMany({
        where: { userId: ctx.session.user.id },
        select: { spotifyPlaylistId: true, id: true },
      });
      const playlists = await Promise.all(
        submission.map(async (s) => {
          const playlistDetail = await getPlaylistDetail(
            ctx.session.access_token,
            s.spotifyPlaylistId
          );
          return { submissionId: s.id, playlist: playlistDetail };
        })
      );
      return {
        playlists,
      };
    },
  })
  .query("detail", {
    input: z.object({ submissionId: z.string() }),
    async resolve({ ctx, input }) {
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: input.submissionId },
      });
      if (!submission) throw Error("No submission found!");
      const playlist = await getPlaylistDetail(
        ctx.session.access_token,
        submission.spotifyPlaylistId
      );
      return { submission, playlist };
    },
  })
  .query("tracks", {
    input: z.object({ submissionId: z.string() }),
    async resolve({ ctx, input }) {
      const requestedTracks = await ctx.prisma.requestedTrack.findMany({
        where: { submissionId: input.submissionId },
        select: { spotifyId: true },
      });
      const trackIds = requestedTracks.map((track) => track.spotifyId);
      const tracks = await getSeveralTracks(trackIds);

      return { tracks };
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
    }),
    async resolve({ ctx, input }) {
      const createdPlaylist = await createPlaylist(
        ctx.session.access_token,
        input.title
      );

      const submission = await ctx.prisma.submission.create({
        data: {
          userId: ctx.session.user.id,
          spotifyPlaylistId: createdPlaylist.id,
        },
      });
      return { submissionId: submission.id };
    },
  });

export default submissionRouter;
