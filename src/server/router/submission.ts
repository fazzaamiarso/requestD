import { SubmissionStatus, SubmissionType } from "@prisma/client";
import { z } from "zod";
import {
  addToQueue,
  addTracksToPlaylist,
  createPlaylist,
  getMyProfile,
  getPlaylistDetail,
  getTrack,
} from "@/lib/spotify";
import { createProtectedRouter } from "./context";
import { dayjs } from "@/lib/dayjs";

const submissionRouter = createProtectedRouter()
  .query("all", {
    async resolve({ ctx }) {
      const submission = await ctx.prisma.submission.findMany({
        where: { userId: ctx.session.user.id },
      });
      const playlists = await Promise.all(
        submission.map(async (s) => {
          if (s.type === "QUEUE") {
            return {
              submission: s,
            };
          }
          const playlistDetail = await getPlaylistDetail(s.spotifyPlaylistId);
          if (!playlistDetail) {
            await ctx.prisma.submission.delete({
              where: { id: s.id },
            });
            return {};
          }
          return {
            submission: s,
            playlist: playlistDetail,
          };
        })
      );
      return {
        playlists,
      };
    },
  })
  .query("my-profile", {
    async resolve({ ctx }) {
      const myProfile = await getMyProfile(ctx.session.access_token);
      return myProfile;
    },
  })
  .query("detail", {
    input: z.object({ submissionId: z.string() }),
    async resolve({ ctx, input }) {
      const submission = await ctx.prisma.submission.findUnique({
        where: { id: input.submissionId },
      });
      if (!submission) throw Error("No submission found!");
      if (submission.type === "PLAYLIST") {
        const playlist = await getPlaylistDetail(submission.spotifyPlaylistId);
        if (!playlist) {
          await ctx.prisma.submission.delete({
            where: { id: submission.id },
          });
          throw Error("No playlist found! Potentially deleted by the owner");
        }
        return { submission, playlist };
      }
      return {
        submission,
      };
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
      type: z.nativeEnum(SubmissionType),
    }),
    async resolve({ ctx, input }) {
      let createdPlaylist:
        | Awaited<ReturnType<typeof createPlaylist>>
        | undefined;
      if (input.type === "PLAYLIST") {
        createdPlaylist = await createPlaylist(
          ctx.session.access_token,
          input.title
        );
      }
      const { id } = await getMyProfile(ctx.session.access_token);
      const createdAt = dayjs().toDate();
      const endsAt =
        input.duration && dayjs().add(Number(input.duration), "hours").toDate();
      const requestLimit = Boolean(input.requestLimit)
        ? Number(input.requestLimit)
        : null;

      const submission = await ctx.prisma.submission.create({
        data: {
          type: input.type,
          queueName: input.title,
          spotifyUserId: id,
          createdAt,
          endsAt,
          personRequestLimit: requestLimit,
          userId: ctx.session.user.id,
          spotifyPlaylistId: createdPlaylist?.createdPlaylist.id ?? "",
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
  })
  .mutation("add-to-queue", {
    input: z.object({
      uri: z.string(),
      requestId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await addToQueue(ctx.session.access_token, { uri: input.uri });
      await ctx.prisma.requestedTrack.update({
        where: { id: input.requestId },
        data: {
          status: "ACCEPTED",
        },
      });
    },
  });

export default submissionRouter;
