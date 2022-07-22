import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Link from "next/link";

const AdminDashboard = () => {
  const { data, isLoading } = trpc.useQuery(["submission.all"]);

  return (
    <>
      <main>
        <h1 className="font-bold text-3xl">Welcome, Admin</h1>
        <ul>
          {!isLoading &&
            data &&
            data.playlists.map(({ playlist, submissionId }) => {
              return (
                <li key={playlist.id}>
                  {playlist.images.length > 0 && (
                    <Image
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      width={50}
                      height={50}
                    />
                  )}
                  {playlist.name}
                  <Link href={`/me/${submissionId}`}>
                    <a className="text-blue-500 hover:underline">Go to live</a>
                  </Link>
                </li>
              );
            })}
        </ul>
        <div>
          <Link href="/me/new">
            <a className="p-4 bg-green-500 inline-block">
              New Playlist Submission
            </a>
          </Link>
        </div>
      </main>
    </>
  );
};
export default AdminDashboard;
