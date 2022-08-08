import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import withAuth from "next-auth/middleware";
// export { default } from "next-auth/middleware";

export default withAuth(
  async function middleware(request: NextRequest) {
    const submissionToken = request.cookies.get("submission-token");
    if (submissionToken) return;

    const randomToken = nanoid();
    const response = NextResponse.next();
    response.cookies.set("submission-token", randomToken, { sameSite: "lax" });

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/me")) {
          return Boolean(token);
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
      signOut: "/",
      error: "/",
    },
  }
);

// This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//   const submissionToken = request.cookies.get("submission-token");
//   if (submissionToken) return;

//   const randomToken = nanoid();
//   const response = NextResponse.next();
//   response.cookies.set("submission-token", randomToken, { sameSite: "lax" });

//   return response;
// }

// See "Matching Paths" below to learn more
// export const config = {
//   matcher: ["/me*"],
// };
