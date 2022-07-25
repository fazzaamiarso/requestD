import Head from "next/head";
import Image from "next/image";
import { NextRouter, useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { CalendarIcon, CheckIcon, XIcon } from "@heroicons/react/solid";
import {
  ClipboardCopyIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/outline";
import type { SubmissionStatus } from "@prisma/client";

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
};

const OwnerSubmission = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string")
    return (
      <h1 className="text-3xl font-bold">No submission found with this Id</h1>
    );

  return <OwnerSubmissionContent submissionId={id} router={router} />;
};

const OwnerSubmissionContent = ({
  submissionId,
  router,
}: {
  submissionId: string;
  router: NextRouter;
}) => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.useQuery([
    "submission.detail",
    { submissionId },
  ]);

  const { data: trackData } = trpc.useQuery([
    "submission.tracks",
    { submissionId },
  ]);

  const mutation = trpc.useMutation(["submission.add-to-playlist"], {
    onSuccess: () => utils.invalidateQueries(["submission.tracks"]),
  });
  const deleteRequest = trpc.useMutation(["submission.reject"], {
    onSuccess: () => utils.invalidateQueries(["submission.tracks"]),
  });
  const statusMutation = trpc.useMutation(["submission.set-status"], {
    onSuccess: () => utils.invalidateQueries(["submission.detail"]),
  });

  if (isLoading) return <p>Loading submission...</p>;
  if (!data) {
    return <p>No submission with this id</p>;
  }

  const isPaused = data.submission.status === "PAUSED";
  const isEnded = data.submission.status === "ENDED";
  const handleResume = () =>
    statusMutation.mutate({ status: "ONGOING", submissionId });
  const handleEnd = () =>
    statusMutation.mutate(
      { status: "ENDED", submissionId },
      { onSuccess: () => utils.invalidateQueries(["submission.tracks"]) }
    );
  const handlePause = () =>
    statusMutation.mutate({ status: "PAUSED", submissionId });

  return (
    <>
      <Head>
        <title>Spotify - NGL | {submissionId}</title>
      </Head>
      <header className="mx-auto mt-6 flex w-11/12 max-w-4xl items-center ">
        <div className="flex flex-col space-y-1">
          <h1 className=" flex items-center gap-3 text-3xl font-bold">
            {data.playlist.name}
            <SubmissionChips status={data.submission.status} />
          </h1>
          <div>
            <span className="flex items-center gap-1 text-sm text-textBody">
              <CalendarIcon className="h-4" />
              {data.submission.createdAt.toDateString()}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {isPaused || isEnded ? (
            <button onClick={handleResume} className="flex items-center gap-1">
              <PlayIcon className="h-6 sm:h-5" />{" "}
              <span className="hidden sm:inline">Resume</span>
            </button>
          ) : (
            <button onClick={handlePause} className="flex items-center gap-1">
              <PauseIcon className="h-6 sm:h-5" />{" "}
              <span className="hidden sm:inline">Pause</span>
            </button>
          )}
          {isEnded ? null : (
            <button onClick={handleEnd} className="flex items-center gap-1">
              <StopIcon className="h-6 sm:h-5" />{" "}
              <span className="hidden sm:inline">End</span>
            </button>
          )}

          <button
            onClick={() =>
              copyToClipboard(`${location.origin}/submission/${submissionId}`)
            }
            className="flex items-center gap-1 rounded-sm p-2 text-textBody ring-1 ring-textHeading"
          >
            <ClipboardCopyIcon className="h-6 sm:h-5" />
            <span className="hidden sm:inline">Copy link</span>
          </button>
        </div>
      </header>
      <main className="mx-auto mt-12 w-11/12 max-w-4xl">
        <h2 className="mb-4 text-xl font-bold">Pending Requests</h2>
        <div className="h-px w-full bg-cardBg" />
        <ul className="my-8 space-y-4">
          {trackData &&
            trackData.tracks.map((track) => {
              return (
                <li
                  key={track.id}
                  className="flex items-center rounded-md bg-cardBg p-4 "
                >
                  {track.album.images[0] && (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.name}
                      height={50}
                      width={50}
                    />
                  )}
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold">{track.name}</h3>
                    <h4 className="text-sm text-textBody">
                      {track.artists[0]?.name}
                    </h4>
                  </div>
                  <div className="ml-auto flex items-center gap-4">
                    <button
                      onClick={() => {
                        mutation.mutate({
                          playlistId: data.playlist.id,
                          tracksData: [
                            {
                              requestId: track.requestId,
                              uri: track.uri,
                            },
                          ],
                        });
                      }}
                      className="flex items-center gap-1 rounded-sm bg-inputBg p-2"
                    >
                      <CheckIcon className="h-6 text-green-400" />
                      <span className="hidden text-textBody sm:inline">
                        Accept
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        deleteRequest.mutate({ requestId: track.requestId });
                      }}
                      className="flex items-center gap-1 rounded-sm bg-inputBg p-2"
                    >
                      <XIcon className="h-6 text-red-400" />
                      <span className="hidden text-textBody sm:inline">
                        Reject
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      </main>
    </>
  );
};

const chipsVariant: Record<SubmissionStatus, string> = {
  ONGOING: "bg-green-200 text-green-600 ring-1 ring-green-600",
  ENDED: "bg-red-200 text-red-600 ring-1 ring-red-600",
  PAUSED: "bg-yellow-200 text-yellow-600 ring-1 ring-yellow-600",
};
const SubmissionChips = ({ status }: { status: SubmissionStatus }) => {
  return (
    <div
      className={`text-normal rounded-full  p-1 px-2 text-xs font-semibold ${chipsVariant[status]}`}
    >
      {status.toLowerCase()}
    </div>
  );
};

export default OwnerSubmission;
