import {
  WialonNotificationParser,
  formatNotificationMessage,
} from '@/lib/notifications/WialonNotification';
import { notificationRepository } from '@/lib/storage/NotificationRepositoryFactory';
import { NotificationDispatcher } from '@/lib/messaging/NotificationDispatcher';

// wialon puede mandar el post como json o como form-urlencoded segun como armes el template
// esta funcion normaliza los dos casos a un objeto plano
async function parseIncomingBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const rawText = await request.text();
  return Object.fromEntries(new URLSearchParams(rawText));
}

export async function POST(request: Request) {
  // el token de seguridad va en la url, configurala como .../api/notifications/wialon?token=TU_SECRETO
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.WIALON_WEBHOOK_SECRET) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  try {
    const rawBody = await parseIncomingBody(request);
    const parsed = WialonNotificationParser.parse(rawBody);

    // por ahora solo guardamos y logueamos, todavia no enviamos nada
    await notificationRepository.add({
      receivedAt: new Date().toISOString(),
      rawBody,
      parsed,
    });

    console.log('notificacion de wialon recibida:', rawBody);

    if (parsed.phone) {
      const message = formatNotificationMessage(parsed);
      // si el envio falla (ej: no hay chat_id mapeado para ese telefono en telegram),
      // no queremos que eso tire abajo la respuesta de captura, que ya se guardo bien
      try {
        await NotificationDispatcher.dispatch(
          parsed.phone,
          message,
          'telegram',
        );
      } catch (dispatchError) {
        console.error('error enviando la notificacion', dispatchError);
      }
    } else {
      console.warn('notificacion sin telefono, no se envia mensaje');
    }

    return Response.json({ ok: true, parsed });
  } catch (error) {
    console.error('error procesando notificacion de wialon', error);
    return Response.json({ error: 'error interno' }, { status: 500 });
  }
}

// endpoint auxiliar para ver rapido las ultimas notificaciones capturadas sin abrir la pagina
export async function GET() {
  return Response.json(await notificationRepository.getAll());
}
