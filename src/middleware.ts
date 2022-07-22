import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const submissionToken = request.cookies.get("submission-token");
  if (submissionToken) return;

  const randomToken = nanoid();
  const response = NextResponse.next();
  response.cookies.set("submission-token", randomToken, { sameSite: "lax" });

  return response;
}

// See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/about/:path*',
// }
