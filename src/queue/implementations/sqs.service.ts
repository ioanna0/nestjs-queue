import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { QueueService } from '../queue.service';

@Injectable()
export class SQSService extends QueueService {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private readonly logger = new Logger(SQSService.name);

  constructor(private configService: ConfigService) {
    super();
    this.sqsClient = new SQSClient({
      endpoint: configService.get<string>('SQS_ENDPOINT'),
      region: configService.get<string>('SQS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.queueUrl = configService.get<string>('SQS_QUEUE_URL');
  }

  async publish(message: string): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: message,
    });
    await this.sqsClient.send(command);
  }

  async subscribe(callback: (message: string) => void, iterations: number = Infinity): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    let count = 0;
    while (count < iterations) {
      count++;
      const command = new ReceiveMessageCommand(params);
      const data = await this.sqsClient.send(command);
      if (data.Messages) {
        for (const message of data.Messages) {
          this.logger.log(`Received message from SQS: ${message.Body}`);
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
