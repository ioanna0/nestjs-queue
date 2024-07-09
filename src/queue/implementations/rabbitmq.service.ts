import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { QueueService } from '../queue.service';

@Injectable()
export class RabbitMQService extends QueueService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private queue: string;

  constructor(private configService: ConfigService) {
    super();
    this.init();
  }

  async init() {
    this.connection = await amqp.connect(this.configService.get<string>('queue.rabbitmq.url'));
    this.channel = await this.connection.createChannel();
    this.queue = this.configService.get<string>('queue.rabbitmq.queue');
    await this.channel.assertQueue(this.queue);
  }

  async publish(message: string): Promise<void> {
    await this.channel.sendToQueue(this.queue, Buffer.from(message));
  }

  async subscribe(callback: (message: string) => void): Promise<void> {
    await this.channel.consume(this.queue, (msg) => {
      if (msg !== null) {
        callback(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }
}
