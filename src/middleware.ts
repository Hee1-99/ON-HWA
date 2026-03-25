import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // 인증이 필요한 경로만 미들웨어 실행 — 수령인/공개 페이지는 제외
  matcher: ['/dashboard/:path*', '/bouquets/:path*', '/archive/:path*', '/login'],
}
