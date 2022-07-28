import { ArrowLeftIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

const GoBackButton = () => {
  const router = useRouter();

  return (
    <button
      className="flex w-max items-center gap-2 transition-all hover:text-materialPurple-200"
      onClick={() => router.back()}
    >
      <ArrowLeftIcon className="h-5" />
      <span className=" hover:underline">Go back</span>
    </button>
  );
};

export default GoBackButton;
