import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { QueueService } from '../queue.service';

@Injectable()
export class SQSService extends QueueService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    super();
    this.sqsClient = new SQSClient({
      endpoint: configService.get<string>('queue.sqs.endpoint'),
      region: configService.get<string>('queue.sqs.region'),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.queueUrl = configService.get<string>('queue.sqs.queueUrl');
  }

  async publish(message: string): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: message,
    });
    await this.sqsClient.send(command);
  }

  async subscribe(callback: (message: string) => void): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    while (true) {
      const command = new ReceiveMessageCommand(params);
      const data = await this.sqsClient.send(command);
      if (data.Messages) {
        for (const message of data.Messages) {
          callback(message.Body);
          const deleteParams = {
            QueueUrl: this.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          };
          const deleteCommand = new DeleteMessageCommand(deleteParams);
          await this.sqsClient.send(deleteCommand);
        }
      }
    }
  }
}
