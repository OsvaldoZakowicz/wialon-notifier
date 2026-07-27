# pendientes: whatsapp

estado actual: el codigo (`WhatsAppAdapter`, `ContactDirectory`, `MessagingProviderFactory`)
ya sabe _como_ mandar un mensaje por whatsapp, tanto texto libre (`send()`) como plantilla
(`sendTemplate()`). lo que falta no es codigo, son decisiones y trámites del lado de OberSat.

## 1. acceso a la api (bloqueante)

OberSat ya tiene el numero de whatsapp business verificado, pero **no acceso a la cloud api**.
son cosas distintas: el numero verificado es el que usan para atender clientes desde la app
normal de whatsapp business; la api requiere un paso aparte en meta business manager para
habilitar ese numero (o uno nuevo) para uso programatico.

pasos, en orden:

1. entrar a [Meta Business Manager](https://business.facebook.com/) con la cuenta de OberSat
2. crear una WhatsApp Business Account (WABA) si todavia no existe una
3. agregar el numero verificado a esa WABA, o agregar un numero dedicado nuevo solo para
   la api (recomendado, para no mezclar la atencion manual con los envios automaticos)
4. generar el `access token` y anotar el `phone_number_id` — esos son los que van en
   `WHATSAPP_ACCESS_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` en el `.env`

## 2. decidir que notificaciones de wialon van por whatsapp (decision de negocio)

mencionaste que hay notificaciones que se disparan un par de veces al dia y otras muy
recurrentes. esto importa por dos motivos concretos:

- **costo**: desde abril 2026 meta cobra por mensaje entregado. una notificacion que se
  dispara muchas veces al dia, multiplicada por la cantidad de clientes de OberSat, puede
  sumar bastante — vale la pena estimarlo antes de habilitar un tipo de notificacion sin
  filtro.
- **calidad del numero**: whatsapp mide la calidad del numero segun como reaccionan los
  destinatarios (si leen, responden, o bloquean/reportan). mandar de mas puede bajar esa
  calificacion y terminar limitando cuanto podés enviar en total, afectando tambien a las
  notificaciones que si importan.

sugerencia para cuando se decida: no todas las notificaciones de wialon necesitan ir por
whatsapp. las muy recurrentes probablemente convengan agrupadas (ej: un resumen cada tantas
horas) en vez de una plantilla por cada evento individual. esto no está resuelto en el
codigo a proposito, porque es una decision de negocio, no tecnica.

## 3. crear y aprobar al menos una plantilla

cada tipo de notificacion que se decida habilitar necesita su propia plantilla, categoria
"utilidad" (no "marketing", que tiene tarifa mas alta y esta pensada para promociones).
la aprobacion de meta tarda entre 24 y 72hs por plantilla, asi que conviene pedirlas con
anticipacion, no el mismo dia que se necesitan.

una vez aprobada, el nombre exacto de la plantilla y su codigo de idioma (ej `es_AR`) son
los parametros que recibe `WhatsAppAdapter.sendTemplate()`.

## 4. opt-in de cada cliente

a diferencia de telegram (donde el cliente le escribe al bot y ese gesto ya sirve como
consentimiento), whatsapp requiere un consentimiento explicito y registrado antes de mandar
el primer mensaje. hay que definir como se recolecta ese consentimiento por cliente de
OberSat (¿un checkbox en el alta? ¿un mensaje de confirmacion?) antes de habilitar el envio.

## 5. conectar el dispatcher

una vez resueltos los puntos 1 a 4, conectar `NotificationDispatcher` para que use
`sendTemplate()` en vez de `send()` para whatsapp es un cambio chico y localizado — no
hace falta tocar `route.ts` ni `ContactDirectory`. queda pendiente definir recien en ese
momento, con las plantillas reales ya aprobadas, como se arma el mapeo
"tipo de notificacion de wialon -> nombre de plantilla + parametros".
