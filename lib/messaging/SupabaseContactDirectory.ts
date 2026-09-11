import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactDirectory } from './ContactDirectory';
import type { MessagingChannel } from './MessagingProviderFactory';

interface ContactRow {
  telegram_chat_id: string | null;
  phone: string | null;
}

/**
 * implementacion contra supabase, para produccion
 *
 * resuelve la lista de destinatarios de un canal segun el parametro "to" del post:
 *   - to=broadcast -> todos los contactos cargados
 *   - to=lucas,mauri -> solo los que matcheen name en la tabla contacts
 * devuelve SIEMPRE un array (vacio si no hay ninguno). los contactos que no tengan
 * el identificador del canal pedido (telegram_chat_id o phone) se descartan.
 */
export class SupabaseContactDirectory implements ContactDirectory {
  constructor(private readonly client: SupabaseClient) {}

  async resolveRecipients(
    to: string,
    channel: MessagingChannel,
  ): Promise<string[]> {
    let query = this.client
      .from('contacts')
      .select('telegram_chat_id, phone');

    if (to !== 'broadcast') {
      query = query.in('name', to.split(','));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `error consultando contactos en supabase: ${error.message}`,
      );
    }

    return (data as ContactRow[])
      .map((row) =>
        channel === 'telegram' ? row.telegram_chat_id : row.phone,
      )
      .filter((value): value is string => value != null);
  }
}