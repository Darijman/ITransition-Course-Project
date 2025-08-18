import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register';
  const isProfilePage = pathname === '/profile' || pathname.startsWith('/profile/');
  const isInventoriesNewPage = pathname === '/inventories/new';

  // Авторизованный юзер не должен заходить на страницы авторизации
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Неавторизованный юзер не должен заходить на страницы профиля или создание инвентаря
  if (!token && (isProfilePage || isInventoriesNewPage)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login', '/auth/register', '/profile/:path*', '/profile', '/inventories/new'],
};
