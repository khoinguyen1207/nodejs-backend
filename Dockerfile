FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json ./
COPY src ./src
COPY ecosystem.config.js ./
COPY .env ./

# Install Python3 for native dependencies
RUN apk add --no-cache python3
RUN npm install pm2 -g
RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 4000

# Start the application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
