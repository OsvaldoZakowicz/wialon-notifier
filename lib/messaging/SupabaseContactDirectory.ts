import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactDirectory } from './ContactDirectory';
import type { MessagingChannel } from './MessagingProviderFactory';

interface ContactRow {
  telegram_chat_id: string | null;
}

/**
 * implementacion contra supabase, para produccion
 *
 * consulta la tabla "contacts" por telefono. si no encuentra ninguna fila (o el
 * telegram_chat_id esta vacio), devuelve undefined, igual que la version en memoria
 * cuando el telefono no estaba cargado
 */
export class SupabaseContactDirectory implements ContactDirectory {
  constructor(private readonly client: SupabaseClient) {}

  async resolveRecipient(
    phone: string,
    channel: MessagingChannel,
  ): Promise<string | undefined> {
    if (channel === 'whatsapp') {
      // whatsapp cloud api identifica al destinatario por su numero de telefono
      // directamente, no necesita consultar la tabla
      return phone;
    }

    const { data, error } = await this.client
      .from('contacts')
      .select('telegram_chat_id')
      .eq('phone', phone)
      .maybeSingle<ContactRow>();

    if (error) {
      throw new Error(
        `error consultando contacto en supabase: ${error.message}`,
      );
    }

    return data?.telegram_chat_id ?? undefined;
  }
}
