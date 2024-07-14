# NestJS Messaging Service

This project is a NestJS API that can publish and subscribe to messages on a queue. The queue implementation can be swapped based on environment variables, supporting AWS SQS and RabbitMQ.

## Features

- Publish and subscribe to messages on a queue.
- Support for AWS SQS and RabbitMQ.
- Ability to switch between queue providers using environment variables.
- Docker setup for local development and testing.

## Prerequisites

- Node.js (v18.x recommended)
- Docker and Docker Compose

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/nestjs-messaging-service.git
cd nestjs-messaging-service
```
## Installation

```bash
$ npm install
```
## Configuration
Create a `.env` (you can use the .env.example) file in the root directory with the following content:
```
QUEUE_PROVIDER=all # sqs | rabbitmq | all
SQS_ENDPOINT=http://localstack:4566
SQS_REGION=us-east-1
SQS_QUEUE_URL=http://localstack:4566/000000000000/nestjs-queue
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE=nestjs-queue
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

```

## Docker Setup
```
docker-compose up --build
```
This will start the NestJS app, LocalStack (for SQS), and RabbitMQ.
## Running the application

By default, the application will use the queue provider specified in the `.env` file. You can change the `QUEUE_PROVIDER` variable to `sqs`, `rabbitmq`, or `all` to use `SQS`, `RabbitMQ`, or both respectively.


### Example Usage
To publish a message:

```
curl -X POST http://localhost:3000/publish -H "Content-Type: application/json" -d '{"message": "Hello, Queue!"}'
```
To subscribe to messages:
```
curl http://localhost:3000/subscribe
```

The message will be displayed on the Docker console.

e.g
```
app-1         | [Nest] 1  - {Timestamp}     LOG [RabbitMQService] Connected to RabbitMQ
app-1         | [Nest] 1  - {Timestamp}     LOG [AppController] Published message: {Message}
```

### Running Tests
```
npm test
```

## Stopping the Application
To stop the Docker containers, run:
```
docker-compose down
```

## Troubleshooting

- If the Docker containers are not running, ensure that the ports `3000` and `6379` are not in use.
- To restart the Docker containers, run:
```
docker-compose down
docker-compose up --build
```

### 500 Error When Posting a New Message
If you encounter a 500 error when posting a new message, try the following steps:

Check the Application Logs: Inspect the logs of the NestJS application to get more details about the error. You can view the logs by running:

- `docker-compose logs app`

Look for any error messages or stack traces that can give you more information about the cause of the error.

Verify Environment Variables: Ensure that all required environment variables are correctly set in the .env file. Missing or incorrect values can cause the application to fail.

Connectivity Issues: Make sure the application can connect to the queue service. For SQS, check LocalStack status:

- `curl http://localhost:4566/_localstack/health`

For RabbitMQ, access the management UI at:

- `http://localhost:15672`

Rebuild Containers: If you made changes to the configuration or environment variables, rebuild the Docker containers:

```
docker-compose down
docker-compose up --build
```

If there was an issue running the init-localstack.sh run it manually after the containers are build with

```
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name nestjs-queue
```