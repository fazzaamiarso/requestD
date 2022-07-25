import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { inferMutationInput, trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import { createRedirect } from "../../utils/server-helper";
import Head from "next/head";
import { SearchIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { InboxInIcon } from "@heroicons/react/outline";
import { useEffect } from "react";
import musicIllustration from "../../assets/happy-music.svg";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Submission } from "@prisma/client";
dayjs.extend(relativeTime);

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const id = params!.id as string;
  const session = await getSession({ req });
  let submission = await prisma.submission.findFirst({
    where: { id },
  });

  const isSubmissionOwner = session?.user?.id === submission?.userId;
  if (isSubmissionOwner) return createRedirect(`/me/${id}`);

  if (
    submission &&
    dayjs().isAfter(submission.endsAt) &&
    submission.status !== "ENDED"
  ) {
    submission = await prisma.submission.update({
      where: { id },
      data: { status: "ENDED" },
    });
  }

  let requestsLeft: number | null = null;
  if (submission && submission.personRequestLimit) {
    const submissionToken = req.cookies["submission-token"];
    const requestCount = await prisma.requestedTrack.count({
      where: { request_token: submissionToken },
    });
    requestsLeft = submission.personRequestLimit - requestCount;
  }

  submission = JSON.parse(JSON.stringify(submission));
  return {
    props: {
      submission,
      requestsLeft,
    },
  };
};

const Submission = ({
  submission,
  requestsLeft,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (!submission) return <h1>No submission with this Id found!</h1>;

  if (requestsLeft && requestsLeft === 0)
    return <h1>You have used all your request</h1>;
  if (submission.status === "ENDED") return <h1>Submission has ended.</h1>;
  if (submission.status === "PAUSED")
    return <h1>Submission has been paused by the owner.</h1>;

  return (
    <SubmissionContent submission={submission} requestsLeft={requestsLeft} />
  );
};

type RequestInput = inferMutationInput<"request.request">;

let firstRender = true;
const SubmissionContent = ({
  submission,
  requestsLeft,
}: {
  submission: Submission;
  requestsLeft: number | null;
}) => {
  const router = useRouter();
  const mutation = trpc.useMutation(["request.search"]);
  const requestMutation = trpc.useMutation(["request.request"], {
    onSuccess: () => router.replace("/thank-you"),
  });

  const handleRequest = (trackId: RequestInput["trackId"]) => {
    requestMutation.mutate({ trackId, submissionId: submission.id });
  };

  useEffect(() => {
    firstRender = false;
  }, []);

  return (
    <>
      <Head>
        <title>Live Submission | Spotify - NGL</title>
      </Head>
      <header className="mx-auto my-8 w-10/12 max-w-xl">
        <h1 className="text-2xl font-semibold ">
          {submission.id} Live submission
        </h1>
        {submission.endsAt && (
          <span className="text-sm text-textBody">
            submission will ends {dayjs(submission.endsAt).fromNow(false)}
          </span>
        )}
        {requestsLeft && submission.personRequestLimit && (
          <span className="text-sm text-textBody">
            {requestsLeft}/{submission.personRequestLimit} request left
          </span>
        )}
        <div className="mt-4 h-px w-full bg-cardBg" />
      </header>
      <main className="mx-auto mt-8 w-10/12  max-w-xl ">
        <div className="flex w-full flex-col space-y-6">
          <div className="text-center ">
            <Image
              src={musicIllustration}
              alt="an illustration of a bird listening to music with headphone on"
              width={150}
              height={150}
            />
            <h2 className="mt-8 text-xl font-semibold">Request a song</h2>
            <p className="text-textBody">
              Search for a song and click on the request button
            </p>
          </div>
          <form
            className=" w-full "
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get("search");
              mutation.mutate({ searchQuery: query as string });
            }}
          >
            <div className="flex w-full items-center gap-4 ">
              <label htmlFor="search" className="sr-only text-lg font-semibold">
                Search Tracks
              </label>
              <input
                required
                type="search"
                name="search"
                id="search"
                className="w-full rounded-md bg-inputBg focus:ring-2 focus:ring-materialPurple-200"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-md bg-materialPurple-200 p-2 font-semibold text-darkBg"
              >
                <SearchIcon className="h-5" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
        {firstRender && <NewReleases onRequest={handleRequest} />}
        {mutation.data && (
          <ul className="my-6 space-y-4">
            {mutation.data.map((item) => {
              return (
                <RequestCard
                  key={item.id}
                  trackId={item.id}
                  artistName={item.artists[0]?.name ?? ""}
                  coverImage={item.album.images[0]?.url ?? ""}
                  name={item.name}
                  onRequest={handleRequest}
                />
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
};
export default Submission;

type RequestCardProps = {
  trackId: string;
  coverImage: string;
  name: string;
  artistName: string;
  onRequest: (trackId: string) => void;
};
const RequestCard = ({
  trackId,
  coverImage,
  name,
  artistName,
  onRequest,
}: RequestCardProps) => {
  return (
    <li className="flex items-center gap-2 rounded-md bg-cardBg p-4 ">
      <Image src={coverImage} alt={name} height={50} width={50} />
      <div className="ml-4">
        <h3 className="font-semibold sm:text-lg">{name}</h3>
        <h4 className="s text-sm text-textBody">{artistName}</h4>
      </div>
      <button
        type="button"
        onClick={() => onRequest(trackId)}
        className="ml-auto flex items-center gap-2 rounded-md bg-inputBg  p-2 text-textBody"
      >
        <InboxInIcon className="h-7 sm:h-6" />{" "}
        <span className="hidden text-sm sm:inline">Request</span>
      </button>
    </li>
  );
};

const NewReleases = ({
  onRequest,
}: {
  onRequest: (input: RequestInput["trackId"]) => void;
}) => {
  const { data } = trpc.useQuery(["request.recommendations"]);

  return (
    <div className="mt-8 w-full">
      <h3 className="font-semibold">New Releases</h3>
      <ul className="my-6 space-y-4">
        {data?.recommendations &&
          data.recommendations.map((item) => {
            return (
              <RequestCard
                key={item.id}
                trackId={item.id}
                artistName={item.artists[0]?.name ?? ""}
                coverImage={item.album.images[0]?.url ?? ""}
                name={item.name}
                onRequest={onRequest}
              />
            );
          })}
      </ul>
    </div>
  );
};

