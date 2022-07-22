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
      <main className="container mx-auto flex h-screen flex-col items-center justify-center p-4">
        <h1>Landing Page</h1>
        <div>
          <>
            {!session?.user && (
              <button onClick={() => signIn("spotify", { callbackUrl: "/me" })}>
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
