import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const OwnerSubmission = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = trpc.useQuery([
    "submission.detail",
    { submissionId: id as string },
  ]);
  if (!data) {
    return <p>No submission with this id</p>;
  }

  return (
    <main>
      <h1 className="text-3xl font-bold">{data.playlist.name}</h1>
    </main>
  );
};
export default OwnerSubmission;
