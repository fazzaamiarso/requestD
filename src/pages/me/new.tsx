import { PlusIcon } from "@heroicons/react/solid";
import Head from "next/head";
import { trpc } from "../../utils/trpc";

const NewSubmission = () => {
  const mutation = trpc.useMutation("submission.create");
  return (
    <>
      <Head>
        <title>New Submission | Spotify - NGL</title>
      </Head>
      <header className="mx-auto w-10/12">
        <h1 className="text-3xl font-bold">New Submission</h1>
      </header>
      <main className="mx-auto my-12 w-10/12 max-w-2xl">
        <form
          className="w-full  rounded-md bg-cardBg p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const title = formData.get("title") as string;

            mutation.mutate(
              { title },
              {
                onSuccess(data) {
                  window.location.replace(`/me/${data.submissionId}`);
                },
              }
            );
          }}
        >
          <div className="flex w-full flex-col space-y-2">
            <label htmlFor="title" className="text-lg font-semibold">
              Playlist name
            </label>
            <input
              type="text"
              required
              id="title"
              name="title"
              className="w-full rounded-sm bg-inputBg"
            />
          </div>
          <button
            type="submit"
            className="mt-8 flex items-center gap-1 rounded-sm bg-green-400 p-3 font-semibold text-darkBg"
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
