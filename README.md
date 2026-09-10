# wialon-notifier

puente entre las notificaciones del constructor de Wialon y canales de mensajeria
(telegram funcionando, whatsapp con la base armada — ver `PENDIENTES.md`).

## estado actual

- captura y parsea el post de wialon
- guarda cada notificacion en supabase (o en memoria si no hay credenciales, para dev local)
- manda el mensaje por telegram al telefono asociado en la tabla `contacts`
- pagina de inspeccion y el listado por api protegidos con usuario y contraseña

## correr local

```bash
npm install
cp .env.example .env.local
```

completar el `.env.local`:

```
WIALON_WEBHOOK_SECRET=dev123
TELEGRAM_BOT_TOKEN=el_token_de_tu_bot
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=lo_que_quieras
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` son opcionales en dev — si se dejan vacias, tanto
las notificaciones como los contactos se guardan en memoria (se pierden al reiniciar el server,
pero sirve para probar sin depender de supabase todo el tiempo).

```bash
npm run dev
```

## supabase

1. crear un proyecto en [supabase.com](https://supabase.com)
2. sql editor → pegar y correr `lib/supabase/schema.sql`
3. cargar tu contacto de prueba (telefono + chat_id de telegram) en la tabla `contacts`,
   con el insert de ejemplo que esta comentado al final del schema
4. project settings → api → copiar `Project URL` y la `service_role` key (no la `anon`,
   esa no tiene permisos de escritura) al `.env.local`

## probar sin wialon (con curl)

```bash
curl -X POST "http://localhost:3000/api/notifications/wialon?token=dev123" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "speed=85&speedLimit=60&exceed=25&unit=Camion01&location=Ruta101km12&time=2026-07-20T10:30:00&driver=Juan+Perez&temp=4.5&fuel=78&licensePlate=ABC123&client=cliente_01&tel=%2B5493751234567"
```

si todo anda bien: responde json, la notificacion queda guardada, y te llega el mensaje por
telegram (si ese telefono esta cargado en `contacts`).

para ver el listado o la pagina, ahora hace falta pasar las credenciales de basic auth:

```bash
curl -u admin:lo_que_quieras http://localhost:3000/api/notifications/wialon
```

## deploy en vercel

1. subir el repo a github
2. importarlo en [vercel.com](https://vercel.com/new)
3. cargar TODAS las variables de `.env.example` en project settings → environment variables
   (supabase y basic auth ya no son opcionales en produccion — sin supabase, cada
   invocacion serverless puede perder los datos; sin basic auth, la pagina queda publica)
4. deploy

la url que te da vercel (`https://tu-proyecto.vercel.app`) es la que va en wialon, ya no hace
falta ngrok — esa herramienta era solo para probar en local antes de tener un dominio real.

## configurar en wialon

en el constructor de notificaciones, accion "ejecutar un post" (o equivalente segun version):

- url: `https://tu-proyecto.vercel.app/api/notifications/wialon?token=TU_SECRETO`
- metodo: post
- content-type: `application/x-www-form-urlencoded`
- body: tu template real, agregando `&client=cliente_01&tel=+5493751234567` al final
  (texto fijo, no son tags de wialon)

## estructura

```
app/
├── layout.tsx
├── page.tsx                              # panel de inspeccion (protegido)
└── api/notifications/wialon/route.ts     # recibe el post, valida, guarda, despacha

lib/
├── notifications/
│   └── WialonNotification.ts             # parser + dto + formateador del mensaje
│
├── storage/                              # historial de notificaciones
│   ├── NotificationRepository.ts         # interfaz
│   ├── InMemoryNotificationRepository.ts # dev local
│   ├── SupabaseNotificationRepository.ts # produccion
│   └── NotificationRepositoryFactory.ts  # elige cual usar
│
├── messaging/                            # todo lo relacionado a enviar mensajes
│   ├── MessageProvider.ts                # interfaz comun (adapter pattern)
│   ├── TelegramAdapter.ts
│   ├── WhatsAppAdapter.ts                # send() + sendTemplate(), ver pendientes
│   ├── MessagingProviderFactory.ts       # elige el adapter segun canal
│   ├── ContactDirectory.ts               # interfaz: telefono -> destinatario por canal
│   ├── InMemoryContactDirectory.ts       # dev local
│   ├── SupabaseContactDirectory.ts       # produccion
│   ├── ContactDirectoryFactory.ts        # elige cual usar
│   └── NotificationDispatcher.ts         # orquesta: resuelve + envia
│
└── supabase/
    ├── client.ts                         # cliente unico y compartido
    └── schema.sql                        # tablas notifications_log y contacts

middleware.ts                             # basic auth (pagina + GET, no el POST de wialon)
PENDIENTES.md                         # que falta para conectar whatsapp de verdad
```

## proximo paso

una vez confirmado en produccion (vercel + supabase + telegram andando con url fija, sin
ngrok), segun lo conversado: sandbox gratuito de whatsapp cloud api para probar
`sendTemplate()` con la plantilla de ejemplo de meta, mientras se resuelven los pendientes
reales del lado de OberSat (ver `PENDIENTES.md`).
