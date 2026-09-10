import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null | undefined;

/**
 * devuelve un cliente de supabase unico y reutilizado (singleton), o null si no hay
 * credenciales configuradas. tanto NotificationRepositoryFactory como
 * ContactDirectoryFactory usan este mismo cliente en vez de crear uno cada uno,
 * asi solo hay un lugar donde leer SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  cachedClient = url && key ? createClient(url, key) : null;
  return cachedClient;
}
