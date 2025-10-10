(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__dc15d093._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    const { pathname } = request.nextUrl;
    // Obtener token de la cookie
    const token = request.cookies.get('auth-token');
    const userInfo = request.cookies.get('user-info');
    // Log para debugging
    console.log('🔍 [MIDDLEWARE] Ruta:', pathname, 'Token:', !!token, 'UserInfo:', !!userInfo);
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password'
    ];
    const isPublicRoute = publicRoutes.includes(pathname);
    // Rutas de la API que no requieren autenticación
    const isApiRoute = pathname.startsWith('/api/');
    // Rutas de autenticación que requieren redirección si ya está autenticado
    const authRoutes = [
        '/login',
        '/register'
    ];
    const isAuthRoute = authRoutes.includes(pathname);
    // Si es una ruta de autenticación y ya está autenticado, redirigir al calendar
    if (isAuthRoute && token && userInfo) {
        console.log('✅ [MIDDLEWARE] Usuario autenticado en ruta de auth, redirigiendo a /calendar');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/calendar', request.url));
    }
    // Si no es una ruta pública y no está autenticado, redirigir al login
    if (!isPublicRoute && !isApiRoute && !token) {
        console.log('❌ [MIDDLEWARE] Usuario no autenticado, redirigiendo a /login');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    // Si es una ruta protegida y está autenticado, permitir acceso
    if (token && userInfo) {
        console.log('✅ [MIDDLEWARE] Usuario autenticado, permitiendo acceso a:', pathname);
        // Agregar headers de usuario para Server Actions
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        response.headers.set('x-user-id', userInfo.value);
        return response;
    }
    // Para todas las demás rutas, permitir acceso
    console.log('🔍 [MIDDLEWARE] Ruta permitida:', pathname);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */ '/((?!_next/static|_next/image|favicon.ico|public/).*)'
    ]
};
}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__dc15d093._.js.map