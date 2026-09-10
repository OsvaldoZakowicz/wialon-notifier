import { InMemoryContactDirectory } from './InMemoryContactDirectory';
import { SupabaseContactDirectory } from './SupabaseContactDirectory';
import type { ContactDirectory } from './ContactDirectory';
import { getSupabaseClient } from '@/lib/supabase/client';

// factory pattern: mismo criterio que NotificationRepositoryFactory - si hay
// credenciales de supabase, las usa; si no, cae a memoria (dev local)
function createContactDirectory(): ContactDirectory {
  const client = getSupabaseClient();

  if (client) {
    return new SupabaseContactDirectory(client);
  }

  console.warn(
    'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no configurados, usando directorio en memoria (solo dev)',
  );
  return new InMemoryContactDirectory();
}

export const contactDirectory = createContactDirectory();
