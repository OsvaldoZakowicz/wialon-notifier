import type { MessageProvider } from './MessageProvider';
import { TelegramAdapter } from './TelegramAdapter';
import { WhatsAppAdapter } from './WhatsAppAdapter';

export type MessagingChannel = 'telegram' | 'whatsapp';

/**
 * factory pattern: centraliza la creacion de adapters y la lectura de sus credenciales
 *
 * el resto del codigo (NotificationDispatcher) solo pide "dame un proveedor para
 * telegram" sin saber que variables de entorno hacen falta ni como se instancia
 */
export class MessagingProviderFactory {
  static create(channel: MessagingChannel): MessageProvider {
    switch (channel) {
      case 'telegram': {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) throw new Error('falta configurar TELEGRAM_BOT_TOKEN');
        return new TelegramAdapter(token);
      }

      case 'whatsapp': {
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!accessToken || !phoneNumberId) {
          throw new Error(
            'falta configurar WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID',
          );
        }
        return new WhatsAppAdapter(accessToken, phoneNumberId);
      }

      default:
        throw new Error(`canal de mensajeria no soportado: ${channel}`);
    }
  }
}
