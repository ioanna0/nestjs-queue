import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { QueueService } from './queue/queue.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly queueService: QueueService) {}

  @Post('publish')
  async publish(@Body('message') message: string) {
    await this.queueService.publish(message);
    this.logger.log(`Published message: ${message}`);
  }

  @Get('subscribe')
  async subscribe() {
    await this.queueService.subscribe((message) => {
      this.logger.log(`Subscribed message: ${message}`);
    });
  }
}
