import type {
  CapturedNotification,
  NotificationRepository,
} from './NotificationRepository';

// singleton pattern: un solo store compartido en todo el proceso
// solo sirve para desarrollo local, en serverless (vercel) no persiste de forma confiable
// entre invocaciones, por eso en produccion se usa SupabaseNotificationRepository en su lugar
export class InMemoryNotificationRepository implements NotificationRepository {
  private static instance: InMemoryNotificationRepository;
  private readonly maxItems = 20;
  private items: CapturedNotification[] = [];

  private constructor() {}

  static getInstance(): InMemoryNotificationRepository {
    if (!InMemoryNotificationRepository.instance) {
      InMemoryNotificationRepository.instance =
        new InMemoryNotificationRepository();
    }
    return InMemoryNotificationRepository.instance;
  }

  async add(notification: CapturedNotification): Promise<void> {
    this.items.unshift(notification);
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(0, this.maxItems);
    }
  }

  async getAll(): Promise<CapturedNotification[]> {
    return this.items;
  }
}
