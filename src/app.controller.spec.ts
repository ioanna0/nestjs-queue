import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { QueueService } from './queue/queue.service';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let queueService: QueueService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: QueueService,
          useValue: {
            publish: jest.fn(),
            subscribe: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    queueService = moduleRef.get<QueueService>(QueueService);
  });

  describe('publish', () => {
    it('should call queueService.publish and log the message', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const message = 'Hello, Queue!';
      await appController.publish(message);
      expect(queueService.publish).toHaveBeenCalledWith(message);
      expect(loggerSpy).toHaveBeenCalledWith(`Published message: ${message}`);
    });
  });

  describe('subscribe', () => {
    it('should call queueService.subscribe and log the subscribed message', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const callback = (callbackFn: (message: string) => void) => {
        callbackFn('Hello, Queue!');
      };
      (queueService.subscribe as jest.Mock).mockImplementation(callback);
      await appController.subscribe();
      expect(queueService.subscribe).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Subscribed message: Hello, Queue!');
    });
  });
});
