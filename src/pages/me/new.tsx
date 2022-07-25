import { PlusIcon } from "@heroicons/react/solid";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

const NewSubmission = () => {
  const [isDurationOn, setIsDurationOn] = useState(false);
  const [isRequestLimitOn, setIsRequestLimitOn] = useState(false);
  const mutation = trpc.useMutation("submission.create");
  return (
    <>
      <Head>
        <title>New Submission | Spotify - NGL</title>
      </Head>
      <header className="mx-auto mt-8 w-10/12 max-w-2xl">
        <h1 className="text-3xl font-bold">New Submission</h1>
      </header>
      <main className="mx-auto my-12 w-10/12 max-w-2xl">
        <form
          className="w-full  space-y-6 rounded-md bg-cardBg p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const title = formData.get("title") as string;
            const duration = formData.get("duration") as string;
            const requestLimit = formData.get("request-limit") as string;

            mutation.mutate(
              { title, duration, requestLimit },
              {
                onSuccess(data) {
                  window.location.replace(`/me/${data.submissionId}`);
                },
              }
            );
          }}
        >
          <div className="mb-12 space-y-8">
            <div className="flex w-full flex-col space-y-2">
              <label htmlFor="title" className="text-lg font-semibold">
                Playlist name
              </label>
              <input
                type="text"
                required
                id="title"
                name="title"
                className="w-full rounded-sm bg-inputBg focus:border-materialPurple-200"
              />
            </div>
            <div className="flex w-full items-start gap-6">
              <input
                type="checkbox"
                checked={isDurationOn}
                onChange={() => setIsDurationOn(!isDurationOn)}
                className="mt-2 border-textHeading bg-transparent text-materialPurple-200 checked:bg-materialPurple-200 "
              />
              <div className="flex flex-col">
                <label htmlFor="duration">Duration (hour)</label>
                <span className="text-sm text-textBody">
                  Set the duration of the submission
                </span>
              </div>
              <input
                type="number"
                min={1}
                name="duration"
                id="duration"
                defaultValue={1}
                disabled={!isDurationOn}
                className=" ml-auto w-20 rounded-sm bg-inputBg focus:border-materialPurple-200 disabled:text-gray-500"
              />
            </div>
            <div className="flex w-full items-start gap-6">
              <input
                type="checkbox"
                checked={isRequestLimitOn}
                onChange={() => setIsRequestLimitOn(!isRequestLimitOn)}
                className="mt-2 border-textHeading bg-transparent text-materialPurple-200 checked:bg-materialPurple-200  "
              />
              <div className="flex flex-col">
                <label htmlFor="request-limit">Request limit</label>
                <span className="text-sm text-textBody">
                  Set the request limit for each person
                </span>
              </div>
              <input
                type="number"
                min={1}
                name="request-limit"
                id="request-limit"
                defaultValue={1}
                disabled={!isRequestLimitOn}
                className=" ml-auto w-20 rounded-sm  bg-inputBg focus:border-materialPurple-200 disabled:text-gray-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-sm bg-materialPurple-200 p-3 font-semibold text-darkBg"
          >
            <PlusIcon className="h-5 " />
            Create
          </button>
        </form>
      </main>
    </>
  );
};

export default NewSubmission;
