import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import { createRedirect } from "@/utils/server-helper";
import { SpotifyLoginButton } from "@/components/atrributions/spotify";
import { NextSeo } from "next-seo";

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
      <NextSeo title="Home" />
      <main className="container mx-auto flex h-screen flex-col items-center justify-center p-4">
        <h1>Landing Page</h1>
        <div>
          <>
            {!session?.user && <SpotifyLoginButton />}
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
