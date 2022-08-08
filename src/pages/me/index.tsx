import { inferQueryOutput, trpc } from "@/utils/trpc";
import Link from "next/link";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import { createRedirect, getUserSession } from "@/utils/server-helper";
import {
  ClipboardCopyIcon,
  LogoutIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";
import { dayjs } from "@/lib/dayjs";
import { TrashIcon } from "@heroicons/react/outline";
import { SubmissionChips } from "@/components/status-chips";
import EmptyIllustration from "@/assets/sub-empty.svg";

import { LoadingSpinner } from "@/components/lottie";
import { copyToClipboard } from "@/utils/client-helper";
import toast from "react-hot-toast";
import { DialogBase } from "@/components/confirmation-dialog";
import { RefObject, useState } from "react";
import { FooterAttributions } from "@/components/atrributions/footer-attributions";
import { NextSeo } from "next-seo";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await getUserSession(req, res);
  if (!session?.user) return createRedirect("/");
  return { props: {} };
};

const copyToast = (toastId: string) =>
  toast("Copied link to clipboard", {
    id: toastId,
    duration: 1500,
    position: "top-center",
  });

const deleteToast = (toastId: string, playlistName: string) =>
  toast(`Submission for ${playlistName} deleted`, {
    id: toastId,
    duration: 2500,
    position: "top-center",
  });

const AdminDashboard = () => {
  const [parent] = useAutoAnimate();
  const utils = trpc.useContext();
  const { data: profile } = trpc.useQuery(["submission.my-profile"]);
  const { data, isLoading } = trpc.useQuery(["submission.all"]);
  const deleteMutation = trpc.useMutation(["submission.delete"], {
    onSuccess: () => utils.invalidateQueries(["submission.all"]),
  });

  const handleDeleteSubmission = ({
    submissionId,
    playlistName,
  }: {
    submissionId: string;
    playlistName: string;
  }) => {
    deleteMutation.mutate(
      { submissionId },
      {
        onSuccess() {
          deleteToast(submissionId, playlistName);
        },
      }
    );
  };

  return (
    <>
      <NextSeo title="Dashboard" />
      <header className="mb-20 bg-[#262627] py-6">
        <div className=" mx-auto flex w-10/12 items-center ">
          <div className="flex items-center gap-4">
            {profile?.images[0]?.url ? (
              <Image
                src={profile.images[0]?.url}
                alt={profile.display_name}
                height={44}
                width={44}
                className="rounded-full"
              />
            ) : (
              <div className="aspect-square  rounded-full">
                <UserCircleIcon className="h-8" />
              </div>
            )}
            <p className="">{profile?.display_name}</p>
          </div>
          <div className="ml-auto flex items-center gap-4 sm:gap-10">
            <button
              onClick={() => signOut()}
              className=" flex items-center gap-2 rounded-sm p-2 text-materialPurple-200 ring-1 ring-materialPurple-200 transition-colors hover:bg-materialPurple-50"
            >
              <span className="hidden text-sm sm:inline">Logout</span>
              <LogoutIcon className="h-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-screen w-10/12">
        <div className="flex">
          <h1 className="text-2xl font-bold">Submissions</h1>
          <Link href="/me/new">
            <a className="ml-auto inline-block rounded-sm bg-materialPurple-400 p-2 px-4 text-sm text-textHeading transition-opacity hover:opacity-80 sm:text-base">
              New submission
            </a>
          </Link>
        </div>
        {!isLoading && !data?.playlists.length && <EmptyState />}
        {isLoading && (
          <div className="mx-auto mt-12">
            <LoadingSpinner />
          </div>
        )}
        <ul
          ref={parent as RefObject<HTMLUListElement>}
          className="mt-10 grid grid-cols-1 gap-4  empty:hidden lg:grid-cols-2"
        >
          {!isLoading &&
            data &&
            data.playlists.map((detail) => {
              if (!detail) return;
              if (
                detail.submission.type === "PLAYLIST" &&
                !Boolean(detail.playlist)
              )
                return;

              return (
                <SubmissionCard
                  key={detail.submission.id}
                  submission={detail.submission}
                  playlist={detail.playlist}
                  onDelete={handleDeleteSubmission}
                />
              );
            })}
        </ul>
      </main>
      <footer className="mx-auto mt-20 mb-8 flex  w-10/12 flex-col items-center text-center text-textBody">
        <FooterAttributions />
      </footer>
    </>
  );
};

export default AdminDashboard;

type SubmissionCardProps = {
  submission: NonNullable<
    inferQueryOutput<"submission.all">["playlists"][0]
  >["submission"];
  playlist: NonNullable<
    inferQueryOutput<"submission.all">["playlists"][0]
  >["playlist"];
  onDelete: (input: { submissionId: string; playlistName: string }) => void;
};

const SubmissionCard = ({
  submission,
  playlist,
  onDelete,
}: SubmissionCardProps) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const handleCopyLink = () => {
    copyToClipboard(`${location.origin}/submission/${submission.id}`);
    copyToast(submission.id);
  };

  const handleDelete = () => {
    setIsOpenDialog(false);
    onDelete({
      submissionId: submission.id,
      playlistName: playlist?.name ?? submission.queueName ?? "",
    });
  };
  return (
    <li className="flex flex-col items-start rounded-md  bg-cardBg p-4 px-6 sm:flex-row sm:items-center">
      <div className="flex flex-col">
        <SubmissionChips status={submission.status} className="mb-1 p-0" />
        <h2 className="text-xl font-semibold">
          {playlist?.name ?? submission.queueName}
        </h2>
        <p className="text-xs text-textBody">
          {dayjs(submission.createdAt).fromNow()}
        </p>
      </div>
      <div className="mt-8 flex w-full items-center gap-8 sm:ml-auto sm:mt-0 sm:w-max sm:gap-6">
        <button onClick={() => setIsOpenDialog(true)}>
          <TrashIcon className="h-6" />
        </button>
        <button onClick={handleCopyLink}>
          <ClipboardCopyIcon className="h-6 " />
        </button>
        <Link href={`/me/${submission.id}`}>
          <a className="ml-auto rounded-sm bg-inputBg p-2 px-3 text-materialPurple-200 transition-all hover:text-materialPurple-100 hover:opacity-90 sm:ml-0">
            Go to live
          </a>
        </Link>
      </div>
      {isOpenDialog && (
        <DialogBase
          title={`Delete ${playlist?.name ?? submission.queueName}?`}
          onConfirm={handleDelete}
          onDismiss={() => setIsOpenDialog(false)}
        >
          <p className="text-sm text-textBody">
            Are you sure you want to delete this submission? You still need to
            manually delete the playlist in Spotify. This action cannot be
            undone.
          </p>
        </DialogBase>
      )}
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="mt-28 flex w-full flex-col items-center gap-2 ">
      <Image
        src={EmptyIllustration}
        alt="Two people holding an empty archive"
        height={200}
        width={200}
      />
      <p className=" text-lg  text-materialPurple-100">
        There are no song requests yet!
      </p>
    </div>
  );
};
