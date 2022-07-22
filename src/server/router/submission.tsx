import { z } from "zod";
import {
  createPlaylist,
  getPlaylistDetail,
  getUsersPlaylists,
} from "../../lib/spotify";
import { createRouter } from "./context";

const submissionRouter = createRouter()
  .query("all", {
    async resolve({ ctx }) {
      if (!ctx.session?.user?.id) throw Error("Must have a session");
      const submission = await ctx.prisma.submission.findMany({
        where: { userId: ctx.session?.user?.id },
        select: { spotifyPlaylistId: true, id: true },
      });
      const playlists = await Promise.all(
        submission.map(async (s) => {
          const res = await getPlaylistDetail(
            ctx.session?.access_token as string,
            s.spotifyPlaylistId
          );
          return { submissionId: s.id, playlist: await res.json() };
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
      const playlistRes = await getPlaylistDetail(
        ctx.session?.access_token as string,
        submission.spotifyPlaylistId
      );
      const playlist = await playlistRes.json();
      return { submission, playlist };
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session?.user?.id) throw Error("Must have a session");
      const data = await createPlaylist(
        ctx.session?.access_token as string,
        input.title
      );
      const response = await data.json();

      const submission = await ctx.prisma.submission.create({
        data: {
          userId: ctx.session?.user?.id,
          spotifyPlaylistId: response.id as string,
        },
      });
      return { submissionId: submission.id };
    },
  });

export default submissionRouter;
