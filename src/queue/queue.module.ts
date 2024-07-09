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
          provide: QueueService,
          useFactory: (configService: ConfigService) => {
            const provider = configService.get<string>('QUEUE_PROVIDER');
            if (provider === 'sqs') {
              return new SQSService(configService);
            } else if (provider === 'rabbitmq') {
              return new RabbitMQService(configService);
            } else {
              throw new Error('Invalid QUEUE_PROVIDER');
            }
          },
          inject: [ConfigService],
        },
      ],
      exports: [QueueService],
    };
  }
}
