import { trpc } from "../../utils/trpc";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { getSession, signOut } from "next-auth/react";
import { createRedirect } from "../../utils/server-helper";
import { ClipboardCopyIcon, LogoutIcon } from "@heroicons/react/solid";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

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
  const { data, isLoading } = trpc.useQuery(["submission.all"]);

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
        <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {isLoading && <p>Loading submissions...</p>}
          {!isLoading &&
            data &&
            data.playlists.map(({ playlist, submissionId, createdAt }) => {
              return (
                <li
                  key={playlist.id}
                  className="flex flex-col items-start rounded-md  bg-cardBg p-4 px-6 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">{playlist.name}</h2>
                    <p className="text-xs text-textBody">
                      {dayjs(createdAt).fromNow()}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-6 sm:ml-auto sm:mt-0">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${location.origin}/submission/${submissionId}`
                        )
                      }
                    >
                      <ClipboardCopyIcon className="h-6 " />
                    </button>
                    <Link href={`/me/${submissionId}`}>
                      <a className="rounded-sm bg-inputBg p-2 px-3 text-materialPurple-200">
                        Go to live
                      </a>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
        <div></div>
      </main>
    </>
  );
};

export default AdminDashboard;
