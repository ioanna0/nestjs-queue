#!/bin/bash

# Wait for LocalStack to be ready
until curl --output /dev/null --silent --head --fail http://localhost:4566/_localstack/health; do
  printf 'Waiting for LocalStack to be ready...'
  sleep 2
done

# Run the initialization script
/docker-entrypoint-initaws.d/init-localstack.sh

# Keep the container running
tail -f /dev/null
