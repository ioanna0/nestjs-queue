import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { QueueService } from '../queue.service';

@Injectable()
export class RabbitMQService extends QueueService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private queue: string;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {
    super();
    this.init();
  }

  async init() {
    this.queue = this.configService.get<string>('RABBITMQ_QUEUE');
    const url = this.configService.get<string>('RABBITMQ_URL');
    
    await this.retryConnect(url);
  }

  async retryConnect(url: string, retries: number = 5): Promise<void> {
    while (retries > 0) {
      try {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(this.queue);
        this.logger.log('Connected to RabbitMQ');
        break;
      } catch (error) {
        this.logger.error('Failed to connect to RabbitMQ', error);
        retries -= 1;
        if (retries === 0) {
          throw error;
        }
        this.logger.log(`Retrying to connect to RabbitMQ (${retries} retries left)...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async publish(message: string): Promise<void> {
    await this.channel.sendToQueue(this.queue, Buffer.from(message));
  }

  async subscribe(callback: (message: string) => void): Promise<void> {
    await this.channel.consume(this.queue, (msg) => {
      if (msg !== null) {
        this.logger.log(`Received message: ${msg.content.toString()}`);
        callback(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }
}
