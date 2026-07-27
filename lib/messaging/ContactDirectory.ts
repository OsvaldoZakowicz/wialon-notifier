import type { MessagingChannel } from './MessagingProviderFactory';

// repository pattern: abstrae de donde sale el mapeo telefono -> identificador por canal
// telegram no permite mandar mensajes a un numero de telefono directo, solo a un chat_id
// (que se obtiene cuando esa persona le escribe primero al bot). whatsapp cloud api si
// acepta el numero de telefono tal cual, asi que ese caso es directo.
export interface ContactDirectory {
  resolveRecipient(
    phone: string,
    channel: MessagingChannel,
  ): string | undefined;
}

// implementacion en memoria para el prototipo, se reemplaza despues por una tabla en base
// de datos (misma interfaz, el resto del codigo no se entera del cambio)
export class InMemoryContactDirectory implements ContactDirectory {
  private readonly telegramChatIdsByPhone: Record<string, string> = {
    '+543765073022': '1527018098', // chat_id obtenido cuando ese contacto le escribio al bot
  };

  resolveRecipient(
    phone: string,
    channel: MessagingChannel,
  ): string | undefined {
    switch (channel) {
      case 'telegram':
        return this.telegramChatIdsByPhone[phone];
      case 'whatsapp':
        return phone;
      default:
        return undefined;
    }
  }
}

export const contactDirectory = new InMemoryContactDirectory();
