import type { MessagingChannel } from './MessagingProviderFactory';

/**
 * repository pattern: abstrae de donde sale el mapeo del parametro "to" del post
 * a los destinatarios de cada canal. "to" es el nombre del tecnico (columna name
 * de la tabla contacts) o el literal "broadcast" (todos los contactos):
 *   - telegram no permite mandar mensajes a un numero de telefono directo, solo a un
 *     chat_id (que se obtiene cuando esa persona le escribe primero al bot)
 *   - whatsapp cloud api identifica al destinatario por su numero de telefono
 * devuelve SIEMPRE un array (vacio si no hay destinatarios para ese canal), nunca undefined
 */
export interface ContactDirectory {
  resolveRecipients(to: string, channel: MessagingChannel): Promise<string[]>;
}
