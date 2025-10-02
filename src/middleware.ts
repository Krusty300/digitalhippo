import { NextRequest, NextResponse } from 'next/server'
import { getServerSideUser } from './lib/payload-utils'

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req
  const { user } = await getServerSideUser(cookies)

  if (
    user &&
    ['/sign-in', '/sign-up'].includes(nextUrl.pathname)
  ) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/`
    )
  }

  // Protect dashboard routes
  if (!user && nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/sign-in`)
    redirectUrl.searchParams.set('origin', 'dashboard')
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}
