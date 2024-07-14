import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { SQSService } from './implementations/sqs.service';
import { RabbitMQService } from './implementations/rabbitmq.service';

@Module({})
export class QueueModule {
  static register(): DynamicModule {
    return {
      module: QueueModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'SQSService',
          useFactory: (configService: ConfigService) => {
            return new SQSService(configService);
          },
          inject: [ConfigService],
        },
        {
          provide: 'RabbitMQService',
          useFactory: (configService: ConfigService) => {
            return new RabbitMQService(configService);
          },
          inject: [ConfigService],
        },
        {
          provide: QueueService,
          useFactory: (
            configService: ConfigService,
            sqsService: SQSService,
            rabbitMQService: RabbitMQService
          ) => {
            const provider = configService.get<string>('QUEUE_PROVIDER');
            if (provider === 'all') {
              return new class extends QueueService {
                async publish(message: string) {
                  await sqsService.publish(message);
                  await rabbitMQService.publish(message);
                }
                async subscribe(callback: (message: string) => void) {
                  await sqsService.subscribe(callback);
                  await rabbitMQService.subscribe(callback);
                }
              };
            } else if (provider === 'sqs') {
              return sqsService;
            } else if (provider === 'rabbitmq') {
              return rabbitMQService;
            } else {
              throw new Error('Invalid QUEUE_PROVIDER');
            }
          },
          inject: [ConfigService, 'SQSService', 'RabbitMQService'],
        },
      ],
      exports: [QueueService],
    };
  }
}
