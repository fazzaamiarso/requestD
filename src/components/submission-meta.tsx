import { ReactNode } from "react";

export const SubmissionMeta = ({
  children,
  Icon,
}: {
  children: ReactNode;
  Icon: (props: React.ComponentProps<"svg">) => JSX.Element;
}) => {
  return (
    <span className="flex items-center gap-1 text-sm text-textBody">
      <Icon className="h-4" />
      {children}
    </span>
  );
};
