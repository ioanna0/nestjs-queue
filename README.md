## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Running Instructions

- Ensure Docker and Docker Compose are installed.
- Create .env file with the necessary configurations.
- Build and run the Docker containers:
```
docker-compose up --build
```

- Access the API at `http://localhost:3000.`
- Publish a message using a `POST` request to `http://localhost:3000/publish` with a JSON body `{ "message": "your message" }`.
- Subscribe to messages using a `GET` request to `http://localhost:3000/subscribe`.


## Troubleshooting

- If the Docker containers are not running, ensure that the ports `3000` and `6379` are not in use.
- To restart the Docker containers, run:
```
docker-compose down
docker-compose up --build
```

## Testing

### Environment Variables

```
QUEUE_PROVIDER=sqs # sqs | rabbitmq 
SQS_ENDPOINT=http://localstack:4566
SQS_REGION=us-east-1
SQS_QUEUE_URL=http://localstack:4566/000000000000/nestjs-queue
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE=nestjs-queue
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```
### Steps
Publishing: `POST` request to `http://localhost:3000/publish` with a JSON body `{ "message": "your message" }`.
e.g
```
curl -X POST http://localhost:3000/publish -H "Content-Type: application/json" -d '{"message": "Hello World!"}'
```

Subscribing: `GET` request to `http://localhost:3000/subscribe`.
e.g
```
curl http://localhost:3000/subscribe
```

The message will be displayed on the Docker console.

e.g
```
app-1         | [Nest] 1  - {Timestamp}     LOG [RabbitMQService] Connected to RabbitMQ
app-1         | [Nest] 1  - {Timestamp}     LOG [AppController] Published message: {Message}
```