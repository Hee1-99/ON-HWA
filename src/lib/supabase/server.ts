import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 컨텍스트에서는 무시 (미들웨어가 세션 갱신 담당)
          }
        },
      },
    }
  )

  // PostgREST RLS에 JWT가 전달되도록 세션을 명시적으로 초기화.
  // getUser()만으로는 DB 쿼리 Authorization 헤더가 설정되지 않는 경우가 있음.
  await client.auth.getSession()

  return client
}
