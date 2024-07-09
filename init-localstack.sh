#!/bin/bash

# Create an SQS queue
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name nestjs-queue

# List all SQS queues to verify creation
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs list-queues
