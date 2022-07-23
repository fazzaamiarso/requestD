import Head from "next/head";

export const Thankyou = () => {
  return (
    <>
      <Head>
        <title>Request Success | Spotify - NGL</title>
      </Head>
      <main className="container mx-auto my-16">
        <h1 className="text-3xl font-bold">
          Your song request has been submitted sucessfully
        </h1>
      </main>
    </>
  );
};

export default Thankyou;
