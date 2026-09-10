import type { ContactDirectory } from './ContactDirectory';
import type { MessagingChannel } from './MessagingProviderFactory';

/**
 * implementacion en memoria, para desarrollo local sin depender de supabase
 *
 * cargar un contacto nuevo es editar este archivo a mano. se usa solo cuando no hay
 * credenciales de supabase configuradas (ver ContactDirectoryFactory)
 */
export class InMemoryContactDirectory implements ContactDirectory {
  private readonly telegramChatIdsByPhone: Record<string, string> = {
    // '+5493751234567': '987654321', // chat_id obtenido cuando ese contacto le escribio al bot
  };

  async resolveRecipient(
    phone: string,
    channel: MessagingChannel,
  ): Promise<string | undefined> {
    switch (channel) {
      case 'telegram':
        return this.telegramChatIdsByPhone[phone];
      case 'whatsapp':
        // whatsapp cloud api identifica al destinatario por su numero de telefono
        // directamente, no necesita ningun mapeo previo
        return phone;
      default:
        return undefined;
    }
  }
}
