import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CapturedNotification,
  NotificationRepository,
} from './NotificationRepository';

// forma de la fila tal como la devuelve supabase (snake_case, distinto al dto que usa el resto de la app)
interface NotificationRow {
  raw_body: Record<string, unknown>;
  parsed: CapturedNotification['parsed'];
  received_at: string;
}

export class SupabaseNotificationRepository implements NotificationRepository {
  private readonly client: SupabaseClient;
  private readonly maxItems = 20;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async add(notification: CapturedNotification): Promise<void> {
    const { error } = await this.client.from('notifications_log').insert({
      raw_body: notification.rawBody,
      parsed: notification.parsed,
      received_at: notification.receivedAt,
    });

    if (error) {
      throw new Error(
        `error guardando notificacion en supabase: ${error.message}`,
      );
    }
  }

  async getAll(): Promise<CapturedNotification[]> {
    const { data, error } = await this.client
      .from('notifications_log')
      .select('raw_body, parsed, received_at')
      .order('received_at', { ascending: false })
      .limit(this.maxItems);

    if (error) {
      throw new Error(
        `error leyendo notificaciones de supabase: ${error.message}`,
      );
    }

    return (data as NotificationRow[]).map((row) => ({
      rawBody: row.raw_body,
      parsed: row.parsed,
      receivedAt: row.received_at,
    }));
  }
}
