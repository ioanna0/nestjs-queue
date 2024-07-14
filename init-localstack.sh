#!/bin/bash

echo "Running init-localstack.sh"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

#!/bin/bash

echo "Starting init-localstack.sh script"

# Function to check if LocalStack is ready
function check_localstack {
  until $(curl --output /dev/null --silent --head --fail http://localhost:4567); do
    printf '.'
    sleep 5
  done
  echo "LocalStack is ready!"
}

echo "Waiting for LocalStack to be ready..."
check_localstack

echo "Creating SQS queue"
aws --endpoint-url=http://localhost:4567 --region us-east-1 sqs create-queue --queue-name nestjs-queue
if [ $? -ne 0 ]; then
  echo "Failed to create SQS queue"
  exit 1
fi

echo "SQS queue created successfully"
