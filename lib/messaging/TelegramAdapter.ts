import type { MessageProvider } from './MessageProvider';

/**
 * adapter para la telegram bot api
 *
 * a diferencia de whatsapp, telegram no exige plantillas pre-aprobadas: cualquier bot
 * puede mandar texto libre en cualquier momento, sin ventanas de tiempo ni aprobacion
 * previa de meta. la unica restriccion real es que el destinatario le tiene que haber
 * escrito primero al bot al menos una vez (ver ContactDirectory)
 */
export class TelegramAdapter implements MessageProvider {
  private readonly botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async send(to: string, message: string): Promise<void> {
    // "to" es el chat_id del destinatario (usuario, grupo o canal), no un numero de telefono
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: to,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`error enviando mensaje por telegram: ${errorBody}`);
    }
  }
}
