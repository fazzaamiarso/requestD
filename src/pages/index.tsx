import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["submission.all"]);
  return (
    <>
      <Head>
        <title>Spotify-ngl</title>
      </Head>
      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1>I should appear</h1>
        <div>
          {data?.data.map((d) => {
            return <li key={d.id}>{d.id}</li>;
          })}
        </div>
      </main>
    </>
  );
};

export default Home;
