// dto con los campos reales que vialon manda en el body, segun el template configurado
// ejemplo de template real:
//
// speed=%SPEED%&speedLimit=%SPEED_LIMIT%&exceed=%SPEEDING_VALUE%&unit=%UNIT%&location=%LOCATION%
// &time=%POS_TIME%&driver=%DRIVER%&temp=%SENSOR(Temperatura)%&fuel=%SENSOR(Combustible)%
// &licensePlate=%CUSTOM_FIELD(Placa)%&client=cliente_01
export interface WialonNotification {
  notificationTitle: string;
  unit: string;
  unitId?: string;
  eventTime: string;
  location?: string;
  speed?: string;
  speedLimit?: string;
  exceed?: string;
  client?: string;
  phone?: string;
}

// parser desacoplado del transporte http, solo transforma datos crudos en el dto
// todos los campos opcionales quedan undefined si ese template no los incluye
export class WialonNotificationParser {
  static parse(raw: Record<string, unknown>): WialonNotification {
    return {
      notificationTitle: String(raw.notificationTitle ?? 'notificacion'),
      unit: String(raw.unit ?? 'unidad desconocida'),
      unitId: this.optionalField(raw.unitId),
      eventTime: String(raw.time ?? new Date().toISOString()),
      location: this.optionalField(raw.location),
      speed: this.optionalField(raw.speed),
      speedLimit: this.optionalField(raw.speedLimit),
      exceed: this.optionalField(raw.exceed),
      client: this.optionalField(raw.client),
      phone: this.optionalField(raw.tel),
    };
  }

  // helper para no repetir la misma verificacion en cada campo opcional
  private static optionalField(value: unknown): string | undefined {
    return value != null && value !== '' ? String(value) : undefined;
  }
}

// formateador separado del parser (single responsibility): arma el texto final del mensaje
export function formatNotificationMessage(
  notification: WialonNotification,
): string {
  const lines = [
    `<b>${notification.notificationTitle}</b>`,
    `unidad: ${notification.unit}`,
    `id de unidad: ${notification.unitId}`,
    `hora: ${notification.eventTime}`,
  ];

  if (notification.location) lines.push(`ubicacion: ${notification.location}`);

  if (notification.speed && notification.exceed) {
    lines.push(
      `exceso de velocidad: ${notification.speed} km/h
        (limite ${notification.speedLimit ?? '?'} km/h, exceso ${notification.exceed})`,
    );
  }

  if (notification.client) lines.push(`cliente: ${notification.client}`);

  return lines.join('\n');
}
