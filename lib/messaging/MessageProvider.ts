/**
 * contrato que deben cumplir todos los adapters de mensajeria (adapter pattern)
 *
 * cada canal de mensajeria (telegram, whatsapp, el que sea a futuro) implementa esta
 * misma interfaz, asi el resto del sistema (dispatcher, factory) nunca necesita saber
 * que canal especifico esta usando, solo que "algo que sabe mandar mensajes" existe
 */
export interface MessageProvider {
  /**
   * envia un mensaje de texto a un destinatario
   *
   * @param to - identificador del destinatario, especifico de cada canal:
   *   telegram: un chat_id (numero)
   *   whatsapp: un numero de telefono en formato internacional
   * @param message - contenido del mensaje a enviar
   */
  send(to: string, message: string): Promise<void>;
}
