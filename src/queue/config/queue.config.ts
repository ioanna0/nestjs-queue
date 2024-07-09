import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  provider: process.env.QUEUE_PROVIDER || 'sqs',
  sqs: {
    endpoint: process.env.SQS_ENDPOINT,
    region: process.env.SQS_REGION,
    queueUrl: process.env.SQS_QUEUE_URL,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    queue: process.env.RABBITMQ_QUEUE,
  },
}));
