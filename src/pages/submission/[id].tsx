import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { createRedirect, getUserSession } from "@/utils/server-helper";
import {
  CalendarIcon,
  SearchIcon,
  TicketIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";
import Image from "next/image";
import { InboxInIcon } from "@heroicons/react/outline";
import musicIllustration from "@/assets/happy-music.svg";
import { dayjs } from "@/lib/dayjs";
import { SubmissionEnded } from "@/components/lottie";
import DoneIllustration from "@/assets/done.svg";
import toast from "react-hot-toast";
import { SubmissionMeta } from "@/components/submission-meta";
import { SearchBySpotify } from "@/components/atrributions/spotify";
import { FooterAttributions } from "@/components/atrributions/footer-attributions";
import { NextSeo } from "next-seo";
import { Spinner } from "@/components/spinner";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "server/router";
import { createContext } from "server/router/context";
import superjson from "superjson";

export const getServerSideProps = async ({
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const id = params!.id as string;
  const session = await getUserSession(req, res);

  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  let submission = await ssg.fetchQuery("request.submission", {
    submissionId: id,
  });
  if (!submission) return createRedirect("/404");

  if (submission.type === "PLAYLIST") {
    const playlistDetail = await ssg.fetchQuery("request.playlist", {
      playlistId: submission.spotifyPlaylistId,
      submissionId: submission.id,
    });
    if (!playlistDetail) return createRedirect("/404");
  }

  await ssg.fetchQuery("request.owner", {
    spotifyUserId: submission.spotifyUserId,
  });

  const isSubmissionOwner = session?.user?.id === submission.userId;
  if (isSubmissionOwner) return createRedirect(`/me/${id}`);

  await ssg.fetchQuery("request.request-count", {
    submissionId: submission.id,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      submissionId: submission.id,
    },
  };
};

const requestSuccessToast = () =>
  toast("Song request sent!", {
    duration: 1500,
  });

type RequestInput = inferMutationInput<"request.request">;

const Submission = ({
  submissionId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { data: submission } = trpc.useQuery([
    "request.submission",
    { submissionId },
  ]);
  if (!submission) return null;

  const { data: ownerProfile } = trpc.useQuery([
    "request.owner",
    { spotifyUserId: submission.spotifyUserId },
  ]);
  const { data: playlist } = trpc.useQuery([
    "request.playlist",
    { playlistId: submission.spotifyPlaylistId, submissionId: submission.id },
  ]);

  const mutation = trpc.useMutation(["request.search"]);
  const requestMutation = trpc.useMutation(["request.request"], {
    onSuccess: () => {
      requestSuccessToast();
      mutation.reset();
      router.replace(`/submission/${submission.id}`);
    },
  });

  const { data: requestCount } = trpc.useQuery([
    "request.request-count",
    { submissionId: submission.id },
  ]);
  if (requestCount === undefined) return null;
  const requestsLeft =
    submission.personRequestLimit &&
    submission.personRequestLimit - requestCount;

  if (requestsLeft && requestsLeft <= 0)
    return (
      <IllustrationPage
        illustration={DoneIllustration}
        message="You have used all of your requests."
      />
    );
  if (submission.status === "ENDED")
    return (
      <EndedPage
        LottieComponent={SubmissionEnded}
        message="Sorry, the submission has ended!"
      />
    );
  if (submission.status === "PAUSED")
    return (
      <EndedPage
        LottieComponent={SubmissionEnded}
        message="Submission has been paused by the owner."
      />
    );

  const noSearchData = !mutation.data;
  const isSearching = mutation.isLoading;
  const isRequesting = requestMutation.isLoading;

  const handleRequest = (trackId: RequestInput["trackId"]) => {
    if (isRequesting) return;
    requestMutation.mutate({ trackId, submissionId: submission.id });
  };
  return (
    <>
      <NextSeo
        title={
          (submission.type === "PLAYLIST"
            ? playlist?.name
            : submission.queueName) ?? ""
        }
        description={`🎼 Give your song recommendation to ${ownerProfile?.display_name}`}
      />
      <header className="mx-auto my-8 w-10/12 max-w-xl">
        <div className="mb-4 flex items-center gap-2 text-sm text-textBody">
          {ownerProfile?.images[0]?.url ? (
            <Image
              src={ownerProfile?.images[0]?.url}
              alt={ownerProfile?.display_name}
              height={32}
              width={32}
              className="rounded-full"
            />
          ) : (
            <div className="aspect-square  rounded-full">
              <UserCircleIcon className="h-8" />
            </div>
          )}
          <p>{`${ownerProfile?.display_name}'s`}</p>
        </div>
        <h1 className="text-2xl font-semibold ">
          {submission.type === "PLAYLIST"
            ? playlist?.name
            : submission.queueName}{" "}
          Live submission
        </h1>
        <SubmissionMeta Icon={CalendarIcon}>
          {submission.endsAt
            ? `Ends ${dayjs(submission.endsAt).fromNow()}`
            : "No duration set"}
        </SubmissionMeta>
        <SubmissionMeta Icon={TicketIcon}>
          {submission.personRequestLimit
            ? `${requestsLeft} requests left`
            : "No request limit"}
        </SubmissionMeta>
        <div className="mt-4 h-px w-full bg-cardBg" />
      </header>
      <main className="mx-auto my-12 w-10/12  max-w-xl ">
        <div className="flex w-full flex-col space-y-6">
          <div className="mb-8 text-center ">
            <Image
              src={musicIllustration}
              alt="an illustration of a bird listening to music with headphone on"
              width={150}
              height={150}
            />
            <h2 className="mt-2 text-xl font-semibold">Request a song</h2>
            <p className="text-textBody">
              Search for a song and click on the request button
            </p>
          </div>
          <form
            className=" w-full "
            onSubmit={(e) => {
              if (mutation.isLoading) return;
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get("search");
              mutation.mutate({ searchQuery: query as string });
            }}
          >
            <SearchBySpotify />
            <div className="mt-2 flex w-full items-center gap-4">
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
                <span>{isSearching ? "Searching.." : "Search"}</span>
              </button>
            </div>
          </form>
        </div>
        {noSearchData && <NewReleases onRequest={handleRequest} />}
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
      <footer className="mx-auto mt-20 mb-8 flex w-10/12 max-w-xl flex-col items-center text-center text-textBody">
        <FooterAttributions />
      </footer>
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
  const utils = trpc.useContext();
  const isRequesting = utils.queryClient.isMutating({
    predicate: (mutation) => {
      return mutation.state.variables.trackId === trackId;
    },
  });
  return (
    <li className="flex items-center gap-2 rounded-md bg-cardBg p-4 ">
      <Image src={coverImage} alt={name} height={50} width={50} />
      <div className="ml-4">
        <h3 className="font-semibold sm:text-lg">{name}</h3>
        <h4 className=" text-sm text-textBody">{artistName}</h4>
      </div>
      <button
        type="button"
        onClick={() => onRequest(trackId)}
        className="ml-auto flex items-center gap-2 rounded-md bg-inputBg p-2 text-textBody transition-all  hover:text-textHeading hover:opacity-90"
      >
        {isRequesting ? <Spinner /> : <InboxInIcon className="h-7 sm:h-6" />}
        <span className="hidden text-sm sm:inline">
          {isRequesting ? "Sending..." : "Request"}
        </span>
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

const IllustrationPage = ({
  illustration,
  message,
}: {
  illustration: string;
  message: string;
}) => {
  return (
    <div className="mt-24 flex w-screen flex-col items-center justify-center">
      <Image src={illustration} alt={message} height={300} width={300} />
      <h1 className=" text-2xl font-bold">{message}</h1>
    </div>
  );
};

const EndedPage = ({
  message,
  LottieComponent,
}: {
  message: string;
  LottieComponent: () => JSX.Element;
}) => {
  return (
    <div className="mt-24 flex w-screen flex-col items-center justify-center">
      <LottieComponent />
      <h1 className="-mt-12 text-xl font-bold">{message}</h1>
    </div>
  );
};
