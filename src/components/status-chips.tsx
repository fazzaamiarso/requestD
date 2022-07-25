import { SubmissionStatus } from "@prisma/client";

const chipsVariant: Record<SubmissionStatus, string> = {
  ONGOING: "bg-green-200 text-green-600 ring-1 ring-green-600",
  ENDED: "bg-red-200 text-red-600 ring-1 ring-red-600",
  PAUSED: "bg-yellow-200 text-yellow-600 ring-1 ring-yellow-600",
};
export const SubmissionChips = ({
  status,
  className = "",
}: {
  status: SubmissionStatus;
  className?: string;
}) => {
  return (
    <div
      className={`text-normal w-max  rounded-full p-1 px-2 text-xs font-semibold ${chipsVariant[status]} ${className}`}
    >
      {status.toLowerCase()}
    </div>
  );
};
