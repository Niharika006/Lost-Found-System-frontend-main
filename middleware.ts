import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  // For now, just pass the request through. 
  // If authentication is needed with the new backend, this middleware 
  // would need to be updated to handle that logic (e.g., checking JWTs).
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)"],
}
