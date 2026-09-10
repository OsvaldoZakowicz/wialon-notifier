import { InMemoryNotificationRepository } from './InMemoryNotificationRepository';
import { SupabaseNotificationRepository } from './SupabaseNotificationRepository';
import type { NotificationRepository } from './NotificationRepository';
import { getSupabaseClient } from '../supabase/client';

// factory pattern: si hay credenciales de supabase configuradas, las usa (produccion);
// si no, cae a memoria (desarrollo local sin necesidad de tener supabase a mano)
function createNotificationRepository(): NotificationRepository {
  const client = getSupabaseClient();

  if (client) {
    return new SupabaseNotificationRepository(client);
  }

  console.warn(
    'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no configurados, usando store en memoria (solo dev)',
  );
  return InMemoryNotificationRepository.getInstance();
}

export const notificationRepository = createNotificationRepository();
