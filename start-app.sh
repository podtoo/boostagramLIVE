#!/bin/bash

# Start the Next.js app with PM2 in the background
pm2-runtime start npm -- start &

# Wait until the Next.js app is ready
echo "Waiting for the Next.js app to start..."

until curl -s -o /dev/null http://localhost:3000; do
  sleep 2
done

echo "Next.js app is up, starting the ping script..."

# Start the pingBoost.sh script
sh pingBoost.sh;
