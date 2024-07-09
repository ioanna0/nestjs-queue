import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQS } from 'aws-sdk';
import { QueueService } from '../queue.service';

@Injectable()
export class SQSService extends QueueService {
  private sqs: SQS;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    super();
    this.sqs = new SQS({
      endpoint: configService.get<string>('queue.sqs.endpoint'),
      region: configService.get<string>('queue.sqs.region'),
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.queueUrl = configService.get<string>('queue.sqs.queueUrl');
  }

  async publish(message: string): Promise<void> {
    await this.sqs.sendMessage({
      QueueUrl: this.queueUrl,
      MessageBody: message,
    }).promise();
  }

  async subscribe(callback: (message: string) => void): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    while (true) {
      const data = await this.sqs.receiveMessage(params).promise();
      if (data.Messages) {
        for (const message of data.Messages) {
          callback(message.Body);
          await this.sqs.deleteMessage({
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          }).promise();
        }
      }
    }
  }
}
