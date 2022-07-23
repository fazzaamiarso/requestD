import { trpc } from "../../utils/trpc";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import { createRedirect } from "../../utils/server-helper";
import { DuplicateIcon } from "@heroicons/react/outline";

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
  const { data: session } = useSession();
  const { data, isLoading } = trpc.useQuery(["submission.all"]);

  return (
    <>
      <header className="mx-auto mb-20 mt-8 flex w-10/12 ">
        <div className="text-3xl font-bold">LOGO</div>
        <button onClick={() => signOut()} className="ml-auto bg-red-500 p-2">
          signOut
        </button>
      </header>
      <main className="mx-auto w-10/12">
        <div className="flex">
          <h1 className="text-2xl font-bold">Submissions</h1>
          <Link href="/me/new">
            <a className="ml-auto inline-block bg-green-500 p-2 text-black">
              New Playlist Submission
            </a>
          </Link>
        </div>
        <ul className="mt-6">
          {isLoading && <p>Loading submissions...</p>}
          {!isLoading &&
            data &&
            data.playlists.map(({ playlist, submissionId, createdAt }) => {
              return (
                <li
                  key={playlist.id}
                  className="flex w-max min-w-[20rem] flex-col rounded-md bg-cardBg p-4 px-6"
                >
                  <h2 className="text-xl font-semibold">{playlist.name}</h2>
                  <p className="text-sm text-textBody">
                    {createdAt.toDateString()}
                  </p>
                  <div className="ml-auto mt-12 flex items-center gap-4">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${location.origin}/submission/${submissionId}`
                        )
                      }
                    >
                      <DuplicateIcon className="h-6" />
                    </button>
                    <Link href={`/me/${submissionId}`}>
                      <a className="text-blue-500 hover:underline">
                        Go to live ➡️
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
