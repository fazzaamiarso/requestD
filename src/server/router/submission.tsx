import { z } from "zod";
import { createPlaylist, getPlaylistDetail } from "../../lib/spotify";
import { createRouter } from "./context";

const submissionRouter = createRouter()
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
      const data = await createPlaylist(
        ctx.session?.access_token as string,
        input.title
      );
      const response = await data.json();

      const submission = await ctx.prisma.submission.create({
        data: {
          spotifyPlaylistId: response.id as string,
        },
      });
      return { submissionId: submission.id };
    },
  });

export default submissionRouter;
