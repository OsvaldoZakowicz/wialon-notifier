// implementacion en memoria para el prototipo, se reemplaza despues por una tabla en base
import type { MessagingChannel } from './MessagingProviderFactory';

/**
 * repository pattern: abstrae de donde sale el mapeo telefono -> identificador por canal
 *
 * cada canal identifica al destinatario de forma distinta:
 *   - telegram no permite mandar mensajes a un numero de telefono directo, solo a un
 *     chat_id (que se obtiene cuando esa persona le escribe primero al bot)
 *   - whatsapp cloud api si acepta el numero de telefono tal cual, no hace falta mapeo
 */
export interface ContactDirectory {
  resolveRecipient(
    phone: string,
    channel: MessagingChannel,
  ): Promise<string | undefined>;
}
