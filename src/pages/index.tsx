import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { createRedirect } from "@/utils/server-helper";

export const getServerSideProps = async ({
  req,
}: GetServerSidePropsContext) => {
  const session = await getSession({ req });

  if (session?.user) {
    return createRedirect("/me");
  }
  return { props: {} };
};

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>RequestD | Home</title>
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
