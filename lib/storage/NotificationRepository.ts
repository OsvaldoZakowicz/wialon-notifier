import type { WialonNotification } from '@/lib/notifications/WialonNotification';

export interface CapturedNotification {
  receivedAt: string;
  rawBody: Record<string, unknown>;
  parsed: WialonNotification;
}

// repository pattern: el resto de la app solo conoce esta interfaz,
// nunca sabe si atras hay memoria, supabase, o lo que sea
export interface NotificationRepository {
  add(notification: CapturedNotification): Promise<void>;
  getAll(): Promise<CapturedNotification[]>;
}
