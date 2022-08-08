import { PlusIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import GoBackButton from "@/components/go-back-button";
import { inferMutationInput, trpc } from "@/utils/trpc";
import { FooterAttributions } from "@/components/atrributions/footer-attributions";
import { NextSeo } from "next-seo";
import { Spinner } from "@/components/spinner";
import { RadioGroup } from "@headlessui/react";
import { SubmissionType } from "@prisma/client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import clsx from "clsx";

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

type FormValues = inferMutationInput<"submission.create">;
type WathcValues = {
  showDuration: boolean;
  showLimit: boolean;
};
const NewSubmission = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues & WathcValues>({
    defaultValues: {
      type: "PLAYLIST",
      duration: "1",
      requestLimit: "1",
    },
  });
  const router = useRouter();
  const isShowDuration = watch("showDuration", false);
  const isShowLimit = watch("showLimit", false);

  const { data: user } = trpc.useQuery(["submission.my-profile"], {
    refetchOnWindowFocus: false,
  });
  const mutation = trpc.useMutation("submission.create");
  const isCreating = mutation.isLoading;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (isCreating) return;
    mutation.mutate(data, {
      onSuccess(data) {
        router.replace(`/me/${data.submissionId}`);
      },
    });
  };

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
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-12 space-y-8">
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value, onBlur } }) => {
                return (
                  <div className="">
                    <RadioGroup
                      value={value}
                      onChange={(val) =>
                        onChange(
                          val === "QUEUE" && user?.product === "premium"
                            ? "QUEUE"
                            : "PLAYLIST"
                        )
                      }
                      onBlur={onBlur}
                      className="space-y-4"
                    >
                      <RadioGroup.Label className="pb-4 text-lg font-semibold">
                        Type
                      </RadioGroup.Label>
                      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                        <RadioOption
                          name={submissionType[0]!.name}
                          description={submissionType[0]!.description}
                        />
                        <RadioOption
                          name={submissionType[1]!.name}
                          description={submissionType[1]!.description}
                          disabled={user?.product !== "premium"}
                        />
                      </div>
                    </RadioGroup>
                  </div>
                );
              }}
            />

            <div className="flex w-full flex-col space-y-2">
              <label htmlFor="title" className="text-lg font-semibold">
                Submission name
              </label>
              <input
                {...register("title", { required: true })}
                type="text"
                id="title"
                className={clsx(
                  "w-full rounded-sm bg-inputBg outline-none  focus:border-materialPurple-200",
                  errors.title
                    ? " focus-border-error border-error  focus:ring-error"
                    : ""
                )}
              />
              {errors.title && (
                <span className="text-sm text-error ">required</span>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Options</h2>
              <div className="flex w-full items-start gap-6">
                <input
                  type="checkbox"
                  {...register("showDuration")}
                  className="mt-2 border-textHeading bg-transparent text-materialPurple-200 checked:bg-materialPurple-200 "
                />
                <div className="flex flex-col">
                  <label htmlFor="duration">Duration (hour)</label>
                  <span className="text-sm text-textBody">
                    Set the duration of the submission
                  </span>
                </div>
                <input
                  {...register("duration", {
                    min: 1,
                    disabled: !isShowDuration,
                  })}
                  type="number"
                  id="duration"
                  disabled={!isShowDuration}
                  className=" ml-auto w-20 rounded-sm bg-inputBg focus:border-materialPurple-200 disabled:text-gray-500"
                />
              </div>
              <div className="flex w-full items-start gap-6">
                <input
                  type="checkbox"
                  {...register("showLimit")}
                  className="mt-2 border-textHeading bg-transparent text-materialPurple-200 checked:bg-materialPurple-200  "
                />
                <div className="flex flex-col">
                  <label htmlFor="request-limit">Request limit</label>
                  <span className="text-sm text-textBody">
                    Set the request limit for each person
                  </span>
                </div>
                <input
                  {...register("requestLimit", {
                    min: 1,
                    disabled: !isShowLimit,
                  })}
                  type="number"
                  id="requestLimit"
                  className=" ml-auto w-20 rounded-sm  bg-inputBg focus:border-materialPurple-200 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-inputBg" />
          <button
            type="submit"
            className="ml-auto flex items-center gap-1 rounded-sm bg-materialPurple-200 p-3  text-darkBg transition-all hover:opacity-80"
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

const RadioOption = ({
  name,
  description,
  disabled = false,
}: {
  name: SubmissionType;
  description: string;
  disabled?: boolean;
}) => {
  return (
    <RadioGroup.Option
      key={name}
      value={name}
      className="flex items-start gap-4"
      disabled={disabled}
    >
      {({ checked }) => (
        <>
          <input
            type="radio"
            className="mt-1 checked:bg-materialPurple-200 hover:bg-materialPurple-200 checked:hover:bg-materialPurple-200 focus:bg-materialPurple-200 disabled:pointer-events-none disabled:opacity-25"
            checked={checked}
            value=""
            disabled={disabled}
          />
          <div className="">
            <RadioGroup.Label>
              {name} <span className="text-sm">(premium only)</span>
            </RadioGroup.Label>
            <p className="text-sm text-textBody disabled:opacity-50">
              {description}
            </p>
          </div>
        </>
      )}
    </RadioGroup.Option>
  );
};