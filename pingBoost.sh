#!/bin/sh

PING_URL_1="http://localhost:3000/api/core/checkBoost"
PING_URL_2="http://localhost:3000/api/system/podcast/checkEpisodes"

# Counter for tracking when to ping the second URL (every hour)
COUNTER=0
PING_INTERVAL_2=720  # 720 iterations of 5 seconds = 3600 seconds (1 hour)

while true; do
  # Ping the first URL every 5 seconds
  response=$(curl -s -o /dev/null -w "%{http_code}" "$PING_URL_1")
  if [ "$response" -eq 200 ]; then
    echo "Ping successful for $PING_URL_1: $response"
  else
    echo "Ping failed for $PING_URL_1: $response"
  fi

  # Check if it's time to ping the second URL (every 1 hour)
  if [ $COUNTER -ge $PING_INTERVAL_2 ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$PING_URL_2")
    if [ "$response" -eq 200 ]; then
      echo "Ping successful for $PING_URL_2: $response"
    else
      echo "Ping failed for $PING_URL_2: $response"
    fi
    COUNTER=0  # Reset the counter after pinging the second URL
  fi

  sleep 5
  COUNTER=$((COUNTER + 1))
done