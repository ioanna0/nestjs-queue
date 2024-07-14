#!/bin/bash

echo "Running init-localstack.sh"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

echo "Creating SQS queue"
aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name nestjs-queue
if [ $? -ne 0 ]; then
  echo "Failed to create SQS queue - Please create it manually by running 'aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs create-queue --queue-name nestjs-queue'"
  exit 1
fi

echo "SQS queue created successfully"
