import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * protege la pagina de inspeccion y el GET del endpoint con basic auth.
 * (convencion "proxy" de next 16, antes se llamaba middleware)
 *
 * el POST de wialon queda afuera a proposito: wialon no puede responder a un prompt
 * de login, y ya se autentica solo con su propio ?token= (ver route.ts). mezclar los
 * dos mecanismos de auth en el mismo request rompería la notificacion real.
 */
export function proxy(request: NextRequest): NextResponse {
  if (request.method === 'POST') {
    return NextResponse.next();
  }

  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  // si no se configuraron credenciales, no bloqueamos (comodo en dev local);
  // en produccion siempre van a estar seteadas en las env vars de vercel
  if (!expectedUser || !expectedPassword) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Basic ')) {
    const encoded = authHeader.slice('Basic '.length);
    const [user, password] = atob(encoded).split(':');

    if (user === expectedUser && password === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse('autenticacion requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="wialon-notifier"' },
  });
}

// solo aplica a la pagina principal y al endpoint de notificaciones (get incluido),
// el resto de rutas estaticas de next (_next/*, favicon, etc.) queda afuera
export const config = {
  matcher: ['/', '/api/notifications/wialon'],
};
