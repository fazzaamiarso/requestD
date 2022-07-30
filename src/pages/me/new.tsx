import { PlusIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useState } from "react";
import GoBackButton from "@/components/go-back-button";
import { trpc } from "@/utils/trpc";
import { FooterAttributions } from "@/components/atrributions/footer-attributions";
import { NextSeo } from "next-seo";
import { Spinner } from "@/components/spinner";
import { RadioGroup } from "@headlessui/react";
import { SubmissionType } from "@prisma/client";

const submissionType: { name: SubmissionType; description: string }[] = [
  {
    name: "PLAYLIST",
    description: "This will create a new playlist on Spotify",
  },
  {
    name: "QUEUE",
    description: "Accepted requests will go to your queue",
  },
];

const NewSubmission = () => {
  const router = useRouter();
  const [type, setType] = useState<SubmissionType>("PLAYLIST");
  const [isDurationOn, setIsDurationOn] = useState(false);
  const [isRequestLimitOn, setIsRequestLimitOn] = useState(false);

  const { data: user, isLoading } = trpc.useQuery(["submission.my-profile"]);
  const mutation = trpc.useMutation("submission.create");
  const isCreating = mutation.isLoading;

  return (
    <>
      <NextSeo title="New Submission" />
      <header className="mx-auto mt-8 w-10/12 max-w-2xl">
        <GoBackButton />
        <h1 className="pt-8 text-2xl font-bold">New Submission</h1>
      </header>
      <main className="mx-auto my-6 w-10/12 max-w-2xl">
        <form
          className="w-full  space-y-6 rounded-md bg-cardBg p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (isCreating) return;
            const formData = new FormData(e.currentTarget);
            const title = formData.get("title") as string;
            const duration = formData.get("duration") as string;
            const requestLimit = formData.get("request-limit") as string;

            mutation.mutate(
              { title, duration, requestLimit, type },
              {
                onSuccess(data) {
                  router.replace(`/me/${data.submissionId}`);
                },
              }
            );
          }}
        >
          <div className="mb-12 space-y-8">
            <div className="">
              <RadioGroup
                value={type}
                onChange={(val) =>
                  setType(() =>
                    val === "QUEUE" && user?.product === "premium"
                      ? "QUEUE"
                      : "PLAYLIST"
                  )
                }
                name="type"
                className="space-y-4"
              >
                <RadioGroup.Label className="pb-4 text-lg font-semibold">
                  Type
                </RadioGroup.Label>
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <RadioGroup.Option
                    key={submissionType[0]?.name}
                    value={submissionType[0]?.name}
                    className="flex items-start gap-4"
                  >
                    {({ checked }) => (
                      <>
                        <input
                          type="radio"
                          className="mt-1 checked:bg-materialPurple-200 hover:bg-materialPurple-200 checked:hover:bg-materialPurple-200 focus:bg-materialPurple-200 "
                          checked={checked}
                          value=""
                        />
                        <div>
                          <RadioGroup.Label className={checked ? "" : ""}>
                            {submissionType[0]?.name}
                          </RadioGroup.Label>
                          <p className="text-sm text-textBody ">
                            {submissionType[0]?.description}
                          </p>
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                  <RadioGroup.Option
                    key={submissionType[1]?.name}
                    value={submissionType[1]?.name}
                    className="flex items-start gap-4"
                    disabled={user?.product !== "premium"}
                  >
                    {({ checked }) => (
                      <>
                        <input
                          type="radio"
                          className="mt-1 checked:bg-materialPurple-200 hover:bg-materialPurple-200 checked:hover:bg-materialPurple-200 focus:bg-materialPurple-200 disabled:pointer-events-none disabled:opacity-25"
                          checked={checked}
                          value=""
                          disabled={user?.product !== "premium"}
                        />
                        <div className="">
                          <RadioGroup.Label className={checked ? "" : ""}>
                            {submissionType[1]?.name}{" "}
                            <span className="text-sm">(premium only)</span>
                          </RadioGroup.Label>
                          <p className="text-sm text-textBody disabled:opacity-50">
                            {submissionType[1]?.description}
                          </p>
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                </div>
              </RadioGroup>
            </div>
            <div className="flex w-full flex-col space-y-2">
              <label htmlFor="title" className="text-lg font-semibold">
                Submission name
              </label>
              <input
                type="text"
                required
                id="title"
                name="title"
                className="w-full rounded-sm bg-inputBg focus:border-materialPurple-200"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Options</h2>
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
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-sm bg-materialPurple-200 p-3 font-semibold text-darkBg transition-all hover:opacity-80"
          >
            {isCreating ? <Spinner /> : <PlusIcon className="h-5 " />}
            {isCreating ? "Creating..." : "Create"}
          </button>
        </form>
      </main>
      <footer className="mx-auto mt-20 mb-8 flex  w-10/12 max-w-2xl flex-col items-center text-center text-textBody">
        <FooterAttributions />
      </footer>
    </>
  );
};

export default NewSubmission;
