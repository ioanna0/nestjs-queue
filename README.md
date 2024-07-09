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

