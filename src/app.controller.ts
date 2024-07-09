import { Controller, Post, Body, Get } from '@nestjs/common';
import { QueueService } from './queue/queue.service';

@Controller()
export class AppController {
  constructor(private readonly queueService: QueueService) {}

  @Post('publish')
  async publish(@Body('message') message: string) {
    await this.queueService.publish(message);
  }

  @Get('subscribe')
  async subscribe() {
    await this.queueService.subscribe((message) => {
      console.log('Received message:', message);
    });
  }
}
