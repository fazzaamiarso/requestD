import Head from "next/head";
import { Animation404 } from "@/components/lottie";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 | RequestD</title>
      </Head>
      <main className="mx-auto mt-20 flex w-10/12 flex-col items-center justify-center text-center">
        <Animation404 />
        <h1 className="-mt-8 text-3xl font-semibold">
          {"We couldn't find what you are looking for"}
        </h1>
      </main>
    </>
  );
};

export default Custom404;
