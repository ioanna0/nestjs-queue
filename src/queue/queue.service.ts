export abstract class QueueService {
  abstract publish(message: string): Promise<void>;
  abstract subscribe(callback: (message: string) => void): Promise<void>;
}
