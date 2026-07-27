import { InMemoryNotificationRepository } from './InMemoryNotificationRepository';
import { SupabaseNotificationRepository } from './SupabaseNotificationRepository';
import type { NotificationRepository } from './NotificationRepository';

// factory pattern: si hay credenciales de supabase configuradas, las usa (produccion);
// si no, cae a memoria (desarrollo local sin necesidad de tener supabase a mano)
function createNotificationRepository(): NotificationRepository {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    return new SupabaseNotificationRepository(supabaseUrl, supabaseKey);
  }

  console.warn(
    'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no configurados, usando store en memoria (solo dev)',
  );
  return InMemoryNotificationRepository.getInstance();
}

export const notificationRepository = createNotificationRepository();
