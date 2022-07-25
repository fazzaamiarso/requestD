import { trpc } from "../../utils/trpc";
import Link from "next/link";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { getSession, signOut } from "next-auth/react";
import { createRedirect } from "../../utils/server-helper";
import { ClipboardCopyIcon, LogoutIcon } from "@heroicons/react/solid";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { TrashIcon } from "@heroicons/react/outline";
import { SubmissionChips } from "../../components/status-chips";
import EmptyIllustration from "../../assets/sub-empty.svg";
dayjs.extend(relativeTime);

import { LoadingSpinner } from "../../components/lottie";

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext) => {
  const session = await getSession({ req });
  if (!session?.user) return createRedirect("/");
  return { props: {} };
};

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
};

const AdminDashboard = () => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.useQuery(["submission.all"]);
  const deleteMutation = trpc.useMutation(["submission.delete"], {
    onSuccess: () => utils.invalidateQueries(["submission.all"]),
  });

  return (
    <>
      <header className="mb-20  bg-[#262627] py-6 ">
        <div className=" mx-auto flex w-10/12 ">
          <div className="text-3xl font-bold">LOGO</div>
          <button
            onClick={() => signOut()}
            className="ml-auto flex items-center gap-2 rounded-sm p-2 text-materialPurple-200 ring-1 ring-materialPurple-200"
          >
            <span>Logout</span>
            <LogoutIcon className="h-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto w-10/12">
        <div className="flex">
          <h1 className="text-2xl font-bold">Submissions</h1>
          <Link href="/me/new">
            <a className="ml-auto inline-block rounded-sm bg-materialPurple-400 p-2 px-4 text-textHeading">
              New submission
            </a>
          </Link>
        </div>
        {!isLoading && !data?.playlists.length && <EmptyState />}
        <ul className="mt-6 grid grid-cols-1 gap-4 empty:hidden lg:grid-cols-2">
          {isLoading && (
            <div className="mt-12">
              <LoadingSpinner />
            </div>
          )}
          {!isLoading &&
            data &&
            data.playlists.map(({ playlist, submission }) => {
              return (
                <li
                  key={playlist.id}
                  className="flex flex-col items-start rounded-md  bg-cardBg p-4 px-6 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col">
                    <SubmissionChips
                      status={submission.status}
                      className="mb-1 p-0"
                    />
                    <h2 className="text-xl font-semibold">{playlist.name}</h2>
                    <p className="text-xs text-textBody">
                      {dayjs(submission.createdAt).fromNow()}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-8 sm:ml-auto sm:mt-0 sm:gap-6">
                    <button
                      onClick={() =>
                        deleteMutation.mutate({ submissionId: submission.id })
                      }
                    >
                      <TrashIcon className="h-6" />
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${location.origin}/submission/${submission.id}`
                        )
                      }
                    >
                      <ClipboardCopyIcon className="h-6 " />
                    </button>
                    <Link href={`/me/${submission.id}`}>
                      <a className="rounded-sm bg-inputBg p-2 px-3 text-materialPurple-200">
                        Go to live
                      </a>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      </main>
    </>
  );
};

export default AdminDashboard;

const EmptyState = () => {
  return (
    <div className="mt-28 flex w-full flex-col items-center gap-2 ">
      <Image
        src={EmptyIllustration}
        alt="Two people holding an empty archive"
        height={100}
        width={100}
      />
      <p className=" text-lg  text-materialPurple-100">
        There are no song requests yet!
      </p>
    </div>
  );
};

