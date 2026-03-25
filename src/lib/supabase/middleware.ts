import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const role = user?.user_metadata?.role as 'florist' | 'general' | undefined

  // Unauthenticated: protect dashboard and archive
  if (!user) {
    if (path.startsWith('/dashboard') || path.startsWith('/archive')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Authenticated: redirect away from login
  if (path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = role === 'general' ? '/archive' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Role-based cross-protection
  if (role === 'general' && path.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/archive'
    return NextResponse.redirect(url)
  }

  if (role === 'florist' && path.startsWith('/archive')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
