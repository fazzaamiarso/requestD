import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import { createRedirect } from "../../utils/server-helper";
import Head from "next/head";
import { SearchCircleIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { InboxInIcon } from "@heroicons/react/outline";

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const id = params!.id as string;
  const session = await getSession({ req });
  const submission = await prisma.submission.findFirst({
    where: { id },
    select: { userId: true },
  });

  const isSubmissionOwner = session?.user?.id === submission?.userId;
  if (isSubmissionOwner) return createRedirect(`/me/${id}`);

  return { props: {} };
};

const Submission = () => {
  const router = useRouter();
  const { id } = router.query;
  const mutation = trpc.useMutation(["request.search"]);
  const requestMutation = trpc.useMutation(["request.request"]);

  return (
    <>
      <Head>
        <title>Live Submission | Spotify - NGL</title>
      </Head>
      <header className="mx-auto w-10/12 ">
        <h1 className="text-2xl font-bold">{id} Live submission</h1>
      </header>
      <main className="mx-auto mt-8 w-10/12  max-w-xl ">
        <form
          className=" w-full "
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const query = formData.get("search");
            mutation.mutate({ searchQuery: query as string });
          }}
        >
          <div className="flex w-full items-center gap-2 ">
            <label htmlFor="search" className="sr-only text-lg font-semibold">
              Search Tracks
            </label>
            <input
              type="search"
              name="search"
              id="search"
              className="w-full rounded-full bg-inputBg"
            />
            <button type="submit">
              <SearchCircleIcon className="h-12" />
            </button>
          </div>
        </form>
        {mutation.data && (
          <ul className="my-6 space-y-4">
            {mutation.data.map((item) => {
              return (
                <li
                  key={item.id}
                  className="flex items-center rounded-md bg-cardBg p-4 "
                >
                  {item.album.images[0] && (
                    <Image
                      src={item.album.images[0].url}
                      alt={item.name}
                      height={50}
                      width={50}
                    />
                  )}
                  <div className="ml-6">
                    <h3 className="font-semibold sm:text-lg">{item.name}</h3>
                    <h4 className="s text-sm text-textBody">
                      {item.artists[0]?.name}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      requestMutation.mutate(
                        {
                          trackId: item.id,
                          submissionId: id as string,
                        },
                        {
                          onSuccess() {
                            window.location.replace("/thank-you");
                          },
                        }
                      )
                    }
                    className="ml-auto flex items-center gap-2 rounded-md bg-inputBg  p-2 text-textBody"
                  >
                    <InboxInIcon className="h-7 sm:h-6" />{" "}
                    <span className="hidden text-sm sm:inline">Request</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
};

export default Submission;
