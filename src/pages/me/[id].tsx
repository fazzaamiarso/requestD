import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const OwnerSubmission = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = trpc.useQuery([
    "submission.detail",
    { submissionId: id as string },
  ]);

  const { data: trackData } = trpc.useQuery([
    "submission.tracks",
    { submissionId: id as string },
  ]);

  if (!data) {
    return <p>No submission with this id</p>;
  }

  return (
    <main>
      <h1 className="text-3xl font-bold">{data.playlist.name}</h1>
      <ul>
        {trackData &&
          trackData.tracks.map((track) => {
            return (
              <li key={track.id}>
                <h2>
                  {track.name} - {track.artists[0]?.name}
                </h2>
                <div className="">
                  <button onClick={() => {}}>accept</button>
                </div>
              </li>
            );
          })}
      </ul>
    </main>
  );
};
export default OwnerSubmission;
