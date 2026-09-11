import {
  MessagingProviderFactory,
  type MessagingChannel,
} from './MessagingProviderFactory';
import { contactDirectory } from './ContactDirectoryFactory';

/**
 * punto unico de entrada para mandar una notificacion, sin importar el canal
 *
 * el route handler no sabe nada de telegram ni whatsapp, ni de como se resuelven
 * los destinatarios: solo le dice "mandale esto a estos tecnicos por este canal"
 */
export class NotificationDispatcher {
  static async dispatch(
    to: string,
    message: string,
    channel: MessagingChannel,
  ): Promise<void> {
    const recipients = await contactDirectory.resolveRecipients(to, channel);

    if (recipients.length === 0) {
      console.warn(
        `no hay destinatarios de ${channel} para "${to}", no se envia mensaje`,
      );
      return;
    }

    const provider = MessagingProviderFactory.create(channel);

    for (const recipient of recipients) {
      try {
        await provider.send(recipient, message);
      } catch (error) {
        // un envio que falla no tira abajo los demas destinatarios
        console.error(`error enviando a ${recipient} por ${channel}`, error);
      }
    }
  }
}