import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import queueConfig from './queue/config/queue.config';
import { QueueModule } from './queue/queue.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [queueConfig],
    }),
    QueueModule.register(),
  ],
  controllers: [AppController],
})
export class AppModule {}
