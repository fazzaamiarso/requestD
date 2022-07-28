import { Animation404 } from "@/components/lottie";
import { NextSeo } from "next-seo";

const Custom404 = () => {
  return (
    <>
      <NextSeo title="404" />
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
