import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Spotify-ngl</title>
      </Head>
      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1>Landing Page</h1>

        <div>{session?.user?.email}</div>
        <div>
          <>
            {!session?.user && (
              <button onClick={() => signIn(undefined, { callbackUrl: "/me" })}>
                Login
              </button>
            )}
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
