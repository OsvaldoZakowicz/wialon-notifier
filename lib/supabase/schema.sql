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


create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- "lucas", "mauri" → el que va en to=
  phone text,                          -- para whatsapp
  telegram_chat_id text,               -- para telegram
  created_at timestamptz not null default now()
);

create index contacts_phone_idx on contacts (phone);

alter table contacts enable row level security;

-- insert de ejemplo para cargar tu primer contacto (name = lo que va en to=)
-- insert into contacts (name, phone, telegram_chat_id) values ('osval', '+5493765073022', '1527018098');

