# wialon-notifier

**estado actual: solo captura.** el endpoint recibe el post de wialon, lo parsea y lo guarda para
inspeccionarlo. el envio por telegram se conecta despues, cuando confirmemos que los datos que
llegan son los esperados.

## correr local

```bash
npm install
cp .env.example .env.local
# completar WIALON_WEBHOOK_SECRET con cualquier valor, ej: dev123
npm run dev
```

esto levanta el server en `http://localhost:3000`.

## probar sin wialon (con curl)

para simular el post que manda wialon, usando tu template real:

```bash
curl -X POST "http://localhost:3000/api/notifications/wialon?token=dev123" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "speed=85&speedLimit=60&exceed=25&unit=Camion01&location=Ruta101km12&time=2026-07-20T10:30:00&driver=Juan+Perez&temp=4.5&fuel=78&licensePlate=ABC123&client=cliente_01"
```

si todo anda bien te responde con json y la notificacion aparece en `http://localhost:3000`
(se refresca sola cada 5 segundos).

## exponer a internet para probar con wialon de verdad

wialon necesita pegarle a una url publica, no a tu `localhost`. mientras desarrollás, la forma
mas rapida es con [ngrok](https://ngrok.com/) o `cloudflared`:

```bash
ngrok http 3000
```

eso te da una url tipo `https://algo-random.ngrok-free.app`. la url completa para configurar en
wialon queda:

```
https://algo-random.ngrok-free.app/api/notifications/wialon?token=dev123
```

## configurar en wialon

en el constructor de notificaciones, accion "ejecutar un post" (o equivalente segun version):

- url: la de arriba (ngrok o tu dominio real)
- metodo: post
- content-type: `application/x-www-form-urlencoded`
- body: tu template real, agregando `&client=cliente_01` al final (texto fijo, identifica al
  cliente de OberSat, no es un tag de wialon)

## estructura actual

- `app/api/notifications/wialon/route.ts` — recibe el post, valida el token, parsea y guarda
- `app/page.tsx` — pagina para ver las ultimas notificaciones capturadas
- `lib/notifications/WialonNotification.ts` — parser: body crudo → dto tipado
- `lib/storage/NotificationStore.ts` — store en memoria (singleton) para el prototipo

## proximo paso

una vez que confirmemos que los datos capturados son los correctos (¿el `client` llega bien?
¿los sensores tienen el nombre esperado? ¿el `time` viene en el formato que pensamos?), conectamos
el envio por telegram: `MessageProvider` + `TelegramAdapter` + `MessagingProviderFactory`
(ya diseñados, quedan afuera del código por ahora a propósito).
