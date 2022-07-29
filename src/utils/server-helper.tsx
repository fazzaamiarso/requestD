import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const createRedirect = (
  destination: string,
  option?: { permanent: boolean }
) => {
  return {
    redirect: {
      destination,
      permanent: option?.permanent || false,
    },
  };
};

type GetUserSessionParams = Parameters<typeof unstable_getServerSession>;
const getUserSession = async (
  req: GetUserSessionParams["0"],
  res: GetUserSessionParams["1"]
) => {
  return unstable_getServerSession(req, res, authOptions);
};

export { createRedirect, getUserSession };
