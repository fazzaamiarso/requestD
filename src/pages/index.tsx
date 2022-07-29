import type { GetServerSidePropsContext, NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { createRedirect, getUserSession } from "@/utils/server-helper";
import { SpotifyLoginButton } from "@/components/atrributions/spotify";
import { NextSeo } from "next-seo";
import Image from "next/image";

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await getUserSession(req, res);

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
        <h1 className="sr-only">Landing Page</h1>
        <Image
          src="https://request-d.vercel.app/logo-on-black.png"
          alt="requestD logo"
          height={200}
          width={350}
        />
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
