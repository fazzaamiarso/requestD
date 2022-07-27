import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";
import {
  addTracksToPlaylist,
  createPlaylist,
  getPlaylistDetail,
  getTrack,
} from "../../lib/spotify";
import { createProtectedRouter } from "./context";
import { dayjs } from "../../lib/dayjs";

const submissionRouter = createProtectedRouter()
  .query("all", {
    async resolve({ ctx }) {
      const submission = await ctx.prisma.submission.findMany({
        where: { userId: ctx.session.user.id },
        select: {
          spotifyPlaylistId: true,
          id: true,
          createdAt: true,
          status: true,
        },
      });
      const playlists = await Promise.all(
        submission.map(async (s) => {
          const playlistDetail = await getPlaylistDetail(
            ctx.session.access_token,
            s.spotifyPlaylistId
          );
          return {
            submission: { id: s.id, createdAt: s.createdAt, status: s.status },
            playlist: playlistDetail,
          };
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
        where: { submissionId: input.submissionId, status: "PENDING" },
        select: { spotifyId: true, id: true },
      });
      const tracks = await Promise.all(
        requestedTracks.map(async (track) => {
          const trackData = await getTrack(track.spotifyId);
          return { ...trackData, requestId: track.id };
        })
      );
      return { tracks };
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      requestLimit: z.string().nullish(),
      duration: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      const createdPlaylist = await createPlaylist(
        ctx.session.access_token,
        input.title
      );

      const createdAt = dayjs().toDate();
      const endsAt =
        input.duration && dayjs().add(Number(input.duration), "hours").toDate();
      const requestLimit = Boolean(input.requestLimit)
        ? Number(input.requestLimit)
        : null;

      const submission = await ctx.prisma.submission.create({
        data: {
          createdAt,
          endsAt,
          personRequestLimit: requestLimit,
          userId: ctx.session.user.id,
          spotifyPlaylistId: createdPlaylist.id,
        },
      });
      return { submissionId: submission.id };
    },
  })
  .mutation("add-to-playlist", {
    input: z.object({
      playlistId: z.string(),
      tracksData: z.array(
        z.object({
          uri: z.string(),
          requestId: z.string(),
        })
      ),
    }),
    async resolve({ ctx, input }) {
      const tracksURI = input.tracksData.map((track) => track.uri);
      const requestIds = input.tracksData.map((track) => track.requestId);
      await addTracksToPlaylist(ctx.session.access_token, {
        playlistId: input.playlistId,
        tracksURI,
      });

      await ctx.prisma.requestedTrack.updateMany({
        where: { id: { in: requestIds } },
        data: {
          status: "ACCEPTED",
        },
      });
      return null;
    },
  })
  .mutation("reject", {
    input: z.object({
      requestId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.requestedTrack.update({
        where: { id: input.requestId },
        data: {
          status: "REJECTED",
        },
      });
      return null;
    },
  })
  .mutation("set-status", {
    input: z.object({
      submissionId: z.string(),
      status: z.nativeEnum(SubmissionStatus),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.submission.update({
        where: { id: input.submissionId },
        data: {
          status: input.status,
        },
      });

      if (input.status === "ONGOING") {
        await ctx.prisma.submission.update({
          where: { id: input.submissionId },
          data: {
            endsAt: undefined,
          },
        });
      }
      if (input.status === "ENDED") {
        await ctx.prisma.submission.update({
          where: { id: input.submissionId },
          data: {
            endsAt: undefined,
          },
        });
        await ctx.prisma.requestedTrack.deleteMany({
          where: { submissionId: input.submissionId },
        });
      }

      return null;
    },
  })
  .mutation("delete", {
    input: z.object({
      submissionId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.submission.delete({
        where: { id: input.submissionId },
      });
    },
  });

export default submissionRouter;
