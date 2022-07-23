import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { CheckIcon, XIcon, DuplicateIcon } from "@heroicons/react/solid";

const copyToClipboard = (content: string) => {
  navigator.clipboard.writeText(content);
};

const OwnerSubmission = () => {
  const router = useRouter();
  const { id } = router.query;

  const utils = trpc.useContext();
  const { data } = trpc.useQuery([
    "submission.detail",
    { submissionId: id as string },
  ]);

  const { data: trackData } = trpc.useQuery([
    "submission.tracks",
    { submissionId: id as string },
  ]);

  const mutation = trpc.useMutation(["submission.add-to-playlist"]);
  const deleteRequest = trpc.useMutation(["submission.delete"]);

  if (!data) {
    return <p>No submission with this id</p>;
  }

  return (
    <>
      <Head>
        <title>Spotify - NGL | {id}</title>
      </Head>
      <header className="mx-auto mt-6 flex w-11/12 items-center">
        <h1 className="mr-6 text-3xl font-bold">{data.playlist.name}</h1>
        <button
          onClick={() => copyToClipboard(`${location.origin}/submission/${id}`)}
          className=""
        >
          <DuplicateIcon className="h-8" />
        </button>
      </header>
      <main className="mx-auto mt-12 w-11/12">
        <h2 className="mb-4 text-xl font-bold">Pending Requests</h2>
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
                        mutation.mutate(
                          {
                            playlistId: data.playlist.id,
                            tracksData: [
                              {
                                requestId: track.requestId,
                                uri: track.uri,
                              },
                            ],
                          },
                          {
                            onSuccess: () =>
                              utils.invalidateQueries(["submission.tracks"]),
                          }
                        );
                      }}
                    >
                      <CheckIcon className="h-6 text-green-400" />
                      <span className="sr-only">Accept song request</span>
                    </button>
                    <button
                      onClick={() => {
                        deleteRequest.mutate(
                          { requestId: track.requestId },
                          {
                            onSuccess: () =>
                              utils.invalidateQueries(["submission.tracks"]),
                          }
                        );
                      }}
                    >
                      <XIcon className="h-6 text-red-400" />
                      <span className="sr-only">Reject song request</span>
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
export default OwnerSubmission;
