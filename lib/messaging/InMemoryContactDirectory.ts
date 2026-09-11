import type { ContactDirectory } from './ContactDirectory';
import type { MessagingChannel } from './MessagingProviderFactory';

interface InMemoryContact {
  telegram_chat_id?: string;
  phone?: string;
}

/**
 * implementacion en memoria, para desarrollo local sin depender de supabase
 *
 * cargar un contacto nuevo es editar este archivo a mano. se usa solo cuando no hay
 * credenciales de supabase configuradas (ver ContactDirectoryFactory)
 */
export class InMemoryContactDirectory implements ContactDirectory {
  // formado por name del tecnico, igual que la columna name de la tabla contacts
  private readonly contactsByName: Record<string, InMemoryContact> = {};

  async resolveRecipients(
    to: string,
    channel: MessagingChannel,
  ): Promise<string[]> {
    const names =
      to === 'broadcast' ? Object.keys(this.contactsByName) : to.split(',');

    return names
      .map((name) => this.contactsByName[name])
      .filter((contact): contact is InMemoryContact => contact != null)
      .map((contact) =>
        channel === 'telegram'
          ? contact.telegram_chat_id
          : contact.phone,
      )
      .filter((value): value is string => value != null);
  }
}