FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Install PM2 globally
RUN npm install --global pm2
# Install necessary @types packages


# Copy "package.json" and "package-lock.json" before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install --production

RUN apk update && apk upgrade
RUN npm install --save-dev @types/papaparse

# Copy all files
COPY ./ ./

# Build app
RUN npm run build
# Grant permission to the images directory
#RUN chown -R node:node /usr/app/public/images
RUN chown -R node:node /usr/app/

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The "node" user is provided in the Node.js Alpine base image
USER node

# Launch app with PM2
CMD [ "pm2-runtime", "start", "npm", "--", "start" ]
