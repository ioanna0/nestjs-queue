import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import * as amqp from 'amqplib';

jest.mock('amqplib');

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let configService: ConfigService;
  let mockChannel: amqp.Channel;
  let mockConnection: amqp.Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RABBITMQ_QUEUE') return 'test-queue';
              if (key === 'RABBITMQ_URL') return 'amqp://localhost';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    configService = module.get<ConfigService>(ConfigService);

    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(null),
      sendToQueue: jest.fn().mockResolvedValue(null),
      consume: jest.fn().mockImplementation((queue, onMessage) => {
        onMessage({
          content: Buffer.from('Hello, Queue!'),
        });
        return { consumerTag: 'mockConsumerTag' };
      }),
      ack: jest.fn().mockResolvedValue(null),
    } as unknown as amqp.Channel;

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    } as unknown as amqp.Connection;

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('init', () => {
    it('should initialize and connect to RabbitMQ', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      await service.init();
      expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('test-queue');
      expect(loggerSpy).toHaveBeenCalledWith('Connected to RabbitMQ');
    });
  });

  describe('publish', () => {
    it('should publish a message to the queue', async () => {
      await service.init(); // Ensure initialization before publish
      await service.publish('Hello, Queue!');
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith('test-queue', Buffer.from('Hello, Queue!'));
    });
  });

  describe('subscribe', () => {
    it('should subscribe to the queue and log received messages', async () => {
      await service.init(); // Ensure initialization before subscribe
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      const callback = jest.fn();
      await service.subscribe(callback);
      expect(mockChannel.consume).toHaveBeenCalledWith('test-queue', expect.any(Function));
      expect(callback).toHaveBeenCalledWith('Hello, Queue!');
      expect(loggerSpy).toHaveBeenCalledWith('Received message from RabbitMQ: Hello, Queue!');
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });
});
