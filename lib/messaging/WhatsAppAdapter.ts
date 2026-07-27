import type { MessageProvider } from './MessageProvider';

/**
 * parametro que rellena una variable {{n}} dentro de una plantilla aprobada por meta
 */
export interface TemplateParameter {
  type: 'text';
  text: string;
}

/**
 * adapter para la whatsapp business cloud api (meta)
 *
 * IMPORTANTE - dos formas de mandar mensajes, no son intercambiables:
 *
 * 1. send() manda texto libre. solo funciona si el destinatario le escribio a este
 *    numero de whatsapp en las ultimas 24hs (ventana de atencion al cliente). fuera de
 *    esa ventana, meta rechaza el mensaje directamente.
 *
 * 2. sendTemplate() manda una plantilla pre-aprobada por meta. es el unico metodo
 *    valido para mensajes iniciados por el negocio sin que el cliente haya escrito
 *    antes - que es exactamente el caso de una alerta de wialon. requiere tener la
 *    plantilla ya aprobada en meta business manager antes de poder usarla.
 *
 * ver /PENDIENTES-WHATSAPP.md para el estado real de esto en OberSat: todavia no hay
 * acceso a la api ni plantillas creadas, asi que ninguno de los dos metodos se puede
 * probar en la practica todavia. el codigo queda listo para cuando eso este resuelto.
 */
export class WhatsAppAdapter implements MessageProvider {
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  /**
   * manda texto libre. solo valido dentro de la ventana de 24hs post-mensaje del cliente.
   * no usar esto para notificaciones proactivas de wialon, va a fallar fuera de esa ventana.
   */
  async send(to: string, message: string): Promise<void> {
    await this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    });
  }

  /**
   * manda una plantilla pre-aprobada. este es el metodo que hay que usar para las
   * alertas de wialon una vez que exista al menos una plantilla aprobada en meta.
   *
   * @param to - numero de telefono destino, formato internacional sin simbolos
   * @param templateName - nombre exacto de la plantilla tal como fue aprobada en meta
   * @param languageCode - codigo de idioma de la plantilla, ej 'es_AR'
   * @param parameters - valores que rellenan las variables {{1}}, {{2}}, etc. del cuerpo
   *   de la plantilla, en el mismo orden en que aparecen
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    parameters: TemplateParameter[] = [],
  ): Promise<void> {
    await this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components:
          parameters.length > 0 ? [{ type: 'body', parameters }] : undefined,
      },
    });
  }

  private async post(body: Record<string, unknown>): Promise<void> {
    const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`error enviando mensaje por whatsapp: ${errorBody}`);
    }
  }
}
