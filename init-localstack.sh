#!/bin/bash

echo "Running init-localstack.sh"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create an SQS queue
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name nestjs-queue

# List all SQS queues to verify creation
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs list-queues

echo "Finished running init-localstack.sh"