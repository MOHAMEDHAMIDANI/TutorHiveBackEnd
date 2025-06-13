FROM node:18-alpine

WORKDIR /app

# Install wait-for-it script
RUN apk add --no-cache bash

COPY package*.json ./

RUN npm install

COPY . .

# Build the application without running migrations
RUN npm run build:prod

# Copy wait-for-it script and make it executable
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 3000

# Use wait-for-it to ensure database is ready before starting
CMD ["/bin/bash", "-c", "/wait-for-it.sh postgres:5432 -- npm run start:dev"] 