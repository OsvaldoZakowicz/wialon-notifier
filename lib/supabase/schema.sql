-- ejecutar en el sql editor de supabase

create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  raw_body jsonb not null,
  parsed jsonb not null,
  received_at timestamptz not null default now()
);

-- indice para listar las mas recientes rapido, que es el unico acceso que necesitamos por ahora
create index notifications_log_received_at_idx on notifications_log (received_at desc);

-- rls activado con una policy simple: solo el backend (service role key) puede leer/escribir,
-- no exponemos esta tabla a clientes del lado del browser
alter table notifications_log enable row level security;


-- tabla de contactos: mapea un telefono al chat_id de telegram correspondiente
-- (whatsapp no necesita mapeo, usa el telefono directo, ver ContactDirectory)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  telegram_chat_id text,
  client_id text,
  created_at timestamptz not null default now()
);

create index contacts_phone_idx on contacts (phone);

alter table contacts enable row level security;

-- carga tu primer contacto de prueba (reemplaza los valores reales):
-- insert into contacts (phone, telegram_chat_id, client_id)
-- values ('+5493751234567', '987654321', 'cliente_01');
