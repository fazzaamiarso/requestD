import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const id = params!.id as string;
  const session = await getSession({ req });
  const submission = await prisma.submission.findFirst({
    where: { id },
    select: { userId: true },
  });

  const isSubmissionOwner = session?.user?.id === submission?.userId;
  if (isSubmissionOwner)
    return {
      redirect: {
        destination: `/me/${id}`,
        permanetnt: false,
      },
    };

  return { props: {} };
};

const Submission = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main>
      <h1>User page</h1>
      <p>{id} Live submission</p>
    </main>
  );
};

export default Submission;
