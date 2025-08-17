import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware para manejar autenticación y redirecciones
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth-token');
  const userInfo = request.cookies.get('user-info');
  
  // Log para debugging
  console.log('🔍 [MIDDLEWARE] Ruta:', pathname, 'Token:', !!token, 'UserInfo:', !!userInfo);
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Rutas de la API que no requieren autenticación
  const isApiRoute = pathname.startsWith('/api/');
  
  // Rutas de autenticación que requieren redirección si ya está autenticado
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Si es una ruta de autenticación y ya está autenticado, redirigir al calendar
  if (isAuthRoute && token && userInfo) {
    console.log('✅ [MIDDLEWARE] Usuario autenticado en ruta de auth, redirigiendo a /calendar');
    return NextResponse.redirect(new URL('/calendar', request.url));
  }
  
  // Si no es una ruta pública y no está autenticado, redirigir al login
  if (!isPublicRoute && !isApiRoute && !token) {
    console.log('❌ [MIDDLEWARE] Usuario no autenticado, redirigiendo a /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si es una ruta protegida y está autenticado, permitir acceso
  if (token && userInfo) {
    console.log('✅ [MIDDLEWARE] Usuario autenticado, permitiendo acceso a:', pathname);
    // Agregar headers de usuario para Server Actions
    const response = NextResponse.next();
    response.headers.set('x-user-id', userInfo.value);
    return response;
  }
  
  // Para todas las demás rutas, permitir acceso
  console.log('🔍 [MIDDLEWARE] Ruta permitida:', pathname);
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 