import { NextResponse, NextRequest } from 'next/server'
import { healthEndpoints } from './src/lib/constants/middleware.constants'

export function redirectTo404(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/404'
  const response = NextResponse.rewrite(url)
  return response
}

function logRequest(req: NextRequest) {
  console.log('Request received', req.nextUrl.pathname)
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl?.pathname?.toLowerCase()
  if (healthEndpoints.some((item: string) => pathname?.includes(item))) {
    const url = req.nextUrl.clone()
    url.pathname = '/api/health'
    return NextResponse.rewrite(url)
  }

  logRequest(req)
  return NextResponse.next()
}
/* we want to run to middleware only before the app routes as an optimization
   Plus other requests apart from app routes don't need any logic
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     * - images
     * - fonts
     */
    '/((?!api|_next/static|_next/image|images|fonts|favicon.ico|favicon.png|monitoring|ingest).*)',
  ],
}
