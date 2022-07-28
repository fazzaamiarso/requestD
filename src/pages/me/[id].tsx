import Image from "next/image";
import { NextRouter, useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import {
  CalendarIcon,
  CheckIcon,
  TicketIcon,
  XIcon,
} from "@heroicons/react/solid";
import {
  ClipboardCopyIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/outline";
import { dayjs } from "@/lib/dayjs";
import NoDataIllustration from "@/assets/no-data.svg";
import { SubmissionChips } from "@/components/status-chips";
import { ReactNode } from "react";
import { copyToClipboard } from "@/utils/client-helper";
import toast, { Toaster } from "react-hot-toast";
import GoBackButton from "@/components/go-back-button";
import { SubmissionMeta } from "@/components/submission-meta";
import { FooterAttributions } from "@/components/atrributions/footer-attributions";
import { NextSeo } from "next-seo";
import { Spinner } from "@/components/spinner";

const OwnerSubmission = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return null;
  }

  return <OwnerSubmissionContent submissionId={id} router={router} />;
};

const copyToast = (toastId: string) =>
  toast("Copied link to clipboard", {
    id: toastId,
    duration: 1500,
    position: "top-center",
  });

const confirmationToast = (toastId: string, message: string) => {
  toast(message, {
    id: toastId,
    duration: 1500,
    position: "top-center",
  });
};

const OwnerSubmissionContent = ({
  submissionId,
  router,
}: {
  submissionId: string;
  router: NextRouter;
}) => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.useQuery(
    ["submission.detail", { submissionId }],
    {
      onSettled: (data) => {
        if (!data) router.replace("/404");
      },
    }
  );

  const { data: trackData, isLoading: isTrackLoading } = trpc.useQuery([
    "submission.tracks",
    { submissionId },
  ]);

  const statusMutation = trpc.useMutation(["submission.set-status"], {
    onSuccess: () => utils.invalidateQueries(["submission.detail"]),
  });
  const isPaused = data?.submission.status === "PAUSED";
  const isEnded = data?.submission.status === "ENDED";
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
      <NextSeo title={data?.playlist.name} />
      <Toaster />
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        data && (
          <header className="mx-auto mt-6 flex w-11/12 max-w-4xl flex-col  items-start gap-4 sm:flex-row sm:items-center ">
            <div className="flex flex-col space-y-1">
              <GoBackButton />
              <h1 className=" flex items-center gap-3 pt-4 text-3xl font-bold">
                {data.playlist.name}
                <SubmissionChips status={data.submission.status} />
              </h1>
              <div className="flex items-center gap-2">
                <SubmissionMeta Icon={CalendarIcon}>
                  {data.submission.endsAt
                    ? `Ends ${dayjs(data.submission.endsAt).fromNow()}`
                    : "No duration set"}
                </SubmissionMeta>
                <SubmissionMeta Icon={TicketIcon}>
                  {data.submission.personRequestLimit
                    ? `${data.submission.personRequestLimit} request limit`
                    : "No request limit"}
                </SubmissionMeta>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4 sm:gap-8">
              {isPaused || isEnded ? (
                <SubmissionButton iconType="play" onClick={handleResume}>
                  Resume
                </SubmissionButton>
              ) : (
                <SubmissionButton iconType="pause" onClick={handlePause}>
                  Pause
                </SubmissionButton>
              )}
              {isEnded ? null : (
                <SubmissionButton iconType="end" onClick={handleEnd}>
                  End
                </SubmissionButton>
              )}

              <button
                onClick={() => {
                  copyToClipboard(
                    `${location.origin}/submission/${submissionId}`
                  );
                  copyToast(data.submission.id);
                }}
                className="flex items-center gap-1 rounded-sm p-2 text-materialPurple-200 ring-1 ring-materialPurple-200 transition-colors hover:bg-materialPurple-100"
              >
                <ClipboardCopyIcon className="h-6 sm:h-5 " />
                <span className="hidden sm:inline">Copy link</span>
              </button>
            </div>
          </header>
        )
      )}
      <main className="mx-auto my-12 min-h-screen w-11/12 max-w-4xl">
        <h2 className="mb-4 text-xl font-bold">Pending Requests</h2>
        <div className="h-px w-full bg-cardBg" />
        {!isTrackLoading && !trackData?.tracks.length && <EmptyState />}
        {isTrackLoading && <CardSkeleton />}
        <ul className="my-8 space-y-4 empty:hidden">
          {trackData &&
            trackData.tracks.map((track) => {
              return (
                <PendingRequestCard
                  key={track.requestId}
                  trackImage={track.album.images[0]?.url}
                  trackName={track.name}
                  artist={track.artists[0]?.name ?? ""}
                  requestId={track.requestId}
                  uri={track.uri}
                  playlistId={data?.playlist.id}
                />
              );
            })}
        </ul>
      </main>
      <footer className="mx-auto mt-20 mb-8 flex w-11/12 max-w-4xl flex-col items-center text-center text-textBody">
        <FooterAttributions />
      </footer>
    </>
  );
};

export default OwnerSubmission;

type PendingRequestCardProps = {
  trackImage: string | undefined;
  trackName: string;
  artist: string;
  requestId: string;
  uri: string;
  playlistId: string | undefined;
};
const PendingRequestCard = ({
  trackImage,
  trackName,
  artist,
  requestId,
  uri,
  playlistId,
}: PendingRequestCardProps) => {
  const utils = trpc.useContext();
  const acceptRequest = trpc.useMutation(["submission.add-to-playlist"], {
    onSuccess: () => {
      utils.invalidateQueries(["submission.tracks"]);
      confirmationToast(requestId, "Request accepted.");
    },
  });
  const deleteRequest = trpc.useMutation(["submission.reject"], {
    onSuccess: () => {
      utils.invalidateQueries(["submission.tracks"]);
      confirmationToast(requestId, "Request rejected.");
    },
  });

  const isAccepting = acceptRequest.isLoading;
  const isRejecting = deleteRequest.isLoading;
  const isBusy = isAccepting || isRejecting;

  return (
    <li className="flex items-center rounded-md bg-cardBg p-4 ">
      {trackImage && (
        <Image src={trackImage} alt={trackName} height={50} width={50} />
      )}
      <div className="ml-6">
        <h3 className="text-lg font-semibold">{trackName}</h3>
        <h4 className="text-sm text-textBody">{artist}</h4>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => {
            if (!playlistId || isBusy) return;
            acceptRequest.mutate({
              playlistId,
              tracksData: [{ requestId, uri }],
            });
          }}
          className="flex items-center gap-1 rounded-sm bg-inputBg p-2 transition-opacity hover:opacity-80"
        >
          {isAccepting ? (
            <Spinner />
          ) : (
            <CheckIcon className="h-6 text-green-400" />
          )}
          <span className="hidden text-textBody sm:inline">
            {isAccepting ? "Accepting.." : "Accept"}
          </span>
        </button>
        <button
          onClick={() => !isBusy && deleteRequest.mutate({ requestId })}
          className="flex items-center gap-1 rounded-sm bg-inputBg p-2 transition-opacity hover:opacity-80"
        >
          {isRejecting ? <Spinner /> : <XIcon className="h-6 text-red-400" />}
          <span className="hidden text-textBody sm:inline">
            {isRejecting ? "Rejecting.." : "Reject"}
          </span>
        </button>
      </div>
    </li>
  );
};

const submissionButtonIcons = {
  pause: PauseIcon,
  play: PlayIcon,
  end: StopIcon,
} as const;

const SubmissionButton = ({
  onClick,
  iconType,
  children,
}: {
  onClick: () => void;
  iconType: keyof typeof submissionButtonIcons;
  children: ReactNode;
}) => {
  const Icon = submissionButtonIcons[iconType];
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 transition-all hover:text-materialPurple-200"
    >
      <Icon className="h-6 sm:h-5" />
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
};

const EmptyState = () => {
  return (
    <div className="mt-28 flex w-full flex-col items-center gap-2 ">
      <Image
        src={NoDataIllustration}
        alt="Two empty clipboard with purple accent"
        height={100}
        width={100}
      />
      <p className=" text-lg  text-materialPurple-100">
        There are no song requests yet!
      </p>
    </div>
  );
};

const HeaderSkeleton = () => {
  return (
    <div className="mx-auto mt-8 w-11/12 max-w-4xl animate-pulse space-y-2">
      <div className="h-8 w-5/12 rounded-md bg-inputBg" />
      <div className="h-4 w-3/12 rounded-md bg-inputBg" />
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      <div className="h-16 w-full rounded-md bg-inputBg" />
      <div className="h-16 w-full rounded-md bg-inputBg" />
      <div className="h-16 w-full rounded-md bg-inputBg" />
      <div className="h-16 w-full rounded-md bg-inputBg" />
      <div className="h-16 w-full rounded-md bg-inputBg" />
      <div className="h-16 w-full rounded-md bg-inputBg" />
    </div>
  );
};
