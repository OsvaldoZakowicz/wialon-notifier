// dto con solo lo que la app consume en su logica: el titulo (primera linea del
// mensaje) y los parametros de ruteo. el resto de los campos del post (speed,
// unit, location, sensores, etc.) NO se tipan aca: se formatean a partir del
// body crudo en formatNotificationMessage y se conservan en rawBody para auditoria
export interface WialonNotification {
  notification: string; // nombre de la notificacion (%NOTIFICATION% de wialon)
  to?: string; // destinatarios tecnicos (broadcast o lista separada por coma)
  channel?: string; // telegram o whatsapp
}

// parser desacoplado del transporte http, solo transforma datos crudos en el dto
// los campos opcionales quedan undefined si ese template no los incluye
export class WialonNotificationParser {
  static parse(raw: Record<string, unknown>): WialonNotification {
    return {
      notification: String(raw.notification ?? 'notificacion'),
      to: this.optionalField(raw.to), // nombre del contacto
      channel: this.optionalField(raw.channel), // telegram, whatsapp
    };
  }

  // helper para no repetir la misma verificacion en cada campo opcional
  private static optionalField(value: unknown): string | undefined {
    return value != null && value !== '' ? String(value) : undefined;
  }
}

// cada renglon define una linea del mensaje: key = nombre del parametro en el
// post (el mismo que pones en el template de wialon, ej: unit=%UNIT%), label =
// lo que mostramos. el formateador descarta automaticamente los valores que no
// llegaron en el post.
//
// IMPORTANTE (comportamiento de wialon con los tags):
//  - si un tag no tiene datos disponibles (ej: condiciones combinadas con OR
//    donde esa condicion no se disparo), wialon deja el texto del tag tal cual,
//    o sea que el valor del post llega como "%SPEED%" sin resolver.
//  - EXCEPCION: un grupo de tags se ocultan automaticamente cuando estan vacios
//    (%UNIT%, %UNIT_GROUP%, %UNIT_ID%, %CURR_TIME%, %POS_TIME%, %MSG_TIME%,
//    %LOCATION%, %LAST_LOCATION%, %LAT%, %LON%, %LATD%, %LOND%, %GOOGLE_LINK%,
//    %LOCATOR_LINK%, %ZONES_ALL%, %ZONE_MIN%, %TAG_NAME%, %TAG_ID%, %SPEED%,
//    %ENGINE_HOURS%, %MILEAGE%, %LOSE_RESTORE%).
//  el formateador cubre ambos casos: descarta null/vacio Y los tags sin resolver.
type LineDef = {
  key: string;
  label: string;
  format?: (value: string) => string;
};

const LINE_DEFS: LineDef[] = [
  // generales: disponibles en practicamente cualquier condicion
  { key: 'unit', label: 'unidad' }, // SIEMPRE primera despues del titulo
  { key: 'unitId', label: 'id de unidad' },
  { key: 'licensePlate', label: 'patente' },
  { key: 'driver', label: 'conductor' },
  { key: 'driverPhone', label: 'telefono del conductor' },
  { key: 'trailer', label: 'remolque' },
  { key: 'unitGroup', label: 'grupos' },
  { key: 'time', label: 'hora' },
  { key: 'currTime', label: 'hora actual' },
  { key: 'msgTime', label: 'hora del mensaje' },
  { key: 'location', label: 'ubicacion' },
  { key: 'lastLocation', label: 'ultima ubicacion' },
  { key: 'zoneMin', label: 'geocerca' },
  { key: 'zonesAll', label: 'geocercas' },
  { key: 'speed', label: 'velocidad', format: (value) => `${value} km/h` },
  { key: 'lat', label: 'latitud' },
  { key: 'lon', label: 'longitud' },
  { key: 'googleLink', label: 'mapa' },
  { key: 'engineHours', label: 'horas de motor' },
  { key: 'mileage', label: 'kilometraje' },
  { key: 'temp', label: 'temperatura' },
  { key: 'fuel', label: 'combustible' },
  { key: 'client', label: 'cliente' },
  { key: 'desc', label: 'descripcion' },
  // especificas por condicion: solo llegan cuando esa condicion se disparo
  { key: 'loseRestore', label: 'estado de conexion' },
  { key: 'zoneInside', label: 'geocerca (ingreso)' },
  { key: 'zoneOutside', label: 'geocerca (salida)' },
  { key: 'zoneDesc', label: 'descripcion de la geocerca' },
  { key: 'otherUnit', label: 'otra unidad' },
  { key: 'sensorName', label: 'sensor' },
  { key: 'sensorValue', label: 'valor del sensor' },
  { key: 'sensorValueOld', label: 'valor anterior' },
  { key: 'triggeredSensors', label: 'sensores disparados' },
  { key: 'paramName', label: 'parametro' },
  { key: 'paramValue', label: 'valor' },
  { key: 'type', label: 'tipo' },
  { key: 'volume', label: 'volumen' },
  { key: 'initialLevel', label: 'nivel inicial' },
  { key: 'finalLevel', label: 'nivel final' },
  { key: 'timeFrom', label: 'desde' },
  { key: 'timeTo', label: 'hasta' },
  { key: 'duration', label: 'duracion' },
  { key: 'criterionType', label: 'tipo de criterio' },
  { key: 'criterionName', label: 'criterio' },
  { key: 'penalty', label: 'penalizacion' },
  { key: 'healthCheckStatus', label: 'estado de salud' },
  { key: 'reason', label: 'motivo' },
  { key: 'serviceName', label: 'servicio' },
  { key: 'serviceTerm', label: 'plazo del servicio' },
  { key: 'msgCount', label: 'cantidad de mensajes' },
  { key: 'smsText', label: 'texto del sms' },
  { key: 'driverId', label: 'id de conductor' },
  { key: 'driverName', label: 'conductor' },
  { key: 'trailerId', label: 'id de remolque' },
  { key: 'trailerName', label: 'remolque' },
  { key: 'tagId', label: 'id de tag' },
  { key: 'tagName', label: 'tag' },
  { key: 'routeName', label: 'ruta' },
  { key: 'routeStatus', label: 'estado de la ruta' },
  { key: 'routePoint', label: 'punto de la ruta' },
  { key: 'routeSchedule', label: 'horario de la ruta' },
  { key: 'roundName', label: 'vuelta' },
];

// los tags que wialon no pudo resolver (sin datos para esa condicion) llegan como
// "%TAG_NAME%" literal en el valor del post. si vemos eso, la linea no tiene datos:
// se descarta igual que un valor vacio.
const UNRESOLVED_TAG = /^%[^%]+%$/;

// formateador separado del parser (single responsibility): arma el texto final del mensaje
export function formatNotificationMessage(
  title: string,
  raw: Record<string, unknown>,
): string {
  const lines = [`<b>${title}</b>`];

  for (const def of LINE_DEFS) {
    const value = raw[def.key];
    if (value == null || value === '') continue; // descarta lineas sin datos
    if (UNRESOLVED_TAG.test(String(value))) continue; // tag sin resolver por wialon
    lines.push(
      `${def.label}: ${def.format ? def.format(String(value)) : String(value)}`,
    );
  }

  return lines.join('\n');
}
