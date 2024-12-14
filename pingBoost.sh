#!/bin/sh

PING_URL="http://localhost:3000/api/core/checkBoost"

while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$PING_URL")
  if [ "$response" -eq 200 ]; then
    echo "Ping successful: $response"
  else
    echo "Ping failed: $response"
  fi
  sleep 5
done
