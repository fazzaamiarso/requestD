import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Link from "next/link";

const AdminDashboard = () => {
  const { data, isLoading } = trpc.useQuery(["playlist"]);

  return (
    <>
      <main>
        <h1 className="font-bold text-3xl">Welcome, Admin</h1>
        <ul>
          {!isLoading &&
            data &&
            data.items.map((item) => {
              return (
                <li key={item.id}>
                  {item.images.length > 0 && (
                    <Image
                      src={item.images[0].url}
                      alt={item.name}
                      width={50}
                      height={50}
                    />
                  )}
                  {item.name}
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
