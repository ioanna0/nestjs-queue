import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, SendMessageCommandOutput, ReceiveMessageCommandOutput } from '@aws-sdk/client-sqs';
import { SQSService } from './sqs.service';
import { Logger } from '@nestjs/common';

jest.mock('@aws-sdk/client-sqs');

describe('SQSService', () => {
  let service: SQSService;
  let configService: ConfigService;
  let mockSQSClient: jest.Mocked<SQSClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SQSService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SQS_ENDPOINT') return 'http://localhost:4566';
              if (key === 'SQS_REGION') return 'us-east-1';
              if (key === 'AWS_ACCESS_KEY_ID') return 'test';
              if (key === 'AWS_SECRET_ACCESS_KEY') return 'test';
              if (key === 'SQS_QUEUE_URL') return 'http://localhost:4566/000000000000/nestjs-queue';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SQSService>(SQSService);
    configService = module.get<ConfigService>(ConfigService);

    mockSQSClient = new SQSClient({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }) as unknown as jest.Mocked<SQSClient>;

    (SQSClient as unknown as jest.Mock).mockImplementation(() => mockSQSClient);
    mockSQSClient.send = jest.fn().mockImplementation((command) => {
      if (command instanceof SendMessageCommand) {
        return Promise.resolve<SendMessageCommandOutput>({ MessageId: '1', $metadata: {} });
      } else if (command instanceof ReceiveMessageCommand) {
        return Promise.resolve<ReceiveMessageCommandOutput>({
          Messages: [
            {
              Body: 'Hello, SQS!',
              ReceiptHandle: 'mockReceiptHandle',
            },
          ],
          $metadata: {},
        });
      }
      return Promise.resolve({});
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publish', () => {
    it('should publish a message to the queue', async () => {
      const message = 'Hello, SQS!';
      await service.publish(message);

      expect(mockSQSClient.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });
  });

  describe('subscribe', () => {
    it('should subscribe to the queue and log received messages', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const callback = jest.fn();

      await service.subscribe(callback, 1); // Limiting iterations to 1 for testing
      expect(mockSQSClient.send).toHaveBeenCalledWith(expect.any(ReceiveMessageCommand));
      expect(loggerSpy).toHaveBeenCalledWith('Received message from SQS: Hello, SQS!');
      expect(callback).toHaveBeenCalledWith('Hello, SQS!');
    });
  });
});
