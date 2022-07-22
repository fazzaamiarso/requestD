import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["playlist"]);

  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Spotify-ngl</title>
      </Head>
      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1>I should appear</h1>
        {!isLoading && data && (
          <div>
            <Image
              src={data.items[0].images[0].url}
              alt={data.items[0].name}
              width={50}
              height={50}
            />
            {data.items[0].name}
          </div>
        )}
        <div>{session?.user?.email}</div>
        <div>
          <>
            {!session?.user && <button onClick={() => signIn()}>Login</button>}
            {session?.user && (
              <button onClick={() => signOut()}>Sign Out</button>
            )}
          </>
        </div>
      </main>
    </>
  );
};

export default Home;
