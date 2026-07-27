import {
  MessagingProviderFactory,
  type MessagingChannel,
} from './MessagingProviderFactory';
import { contactDirectory } from './ContactDirectory';

/**
 * punto unico de entrada para mandar una notificacion, sin importar el canal
 *
 * el route handler no sabe nada de telegram ni whatsapp, ni de como se resuelve el
 * destinatario: solo le dice "mandale esto a este telefono por este canal"
 */
export class NotificationDispatcher {
  static async dispatch(
    phone: string,
    message: string,
    channel: MessagingChannel,
  ): Promise<void> {
    const recipient = contactDirectory.resolveRecipient(phone, channel);

    if (!recipient) {
      throw new Error(
        `no se encontro destinatario de ${channel} para el telefono ${phone}`,
      );
    }

    const provider = MessagingProviderFactory.create(channel);
    await provider.send(recipient, message);
  }
}
