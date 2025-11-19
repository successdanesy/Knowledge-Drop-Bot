# Use Node 18 (required for your dependencies)

FROM node:18-alpine

# Install build dependencies for canvas and sharp

RUN apk add --no-cache \

    python3 \

    make \

    g++ \

    cairo-dev \

    jpeg-dev \

    pango-dev \

    giflib-dev \

    pixman-dev

# Set working directory

WORKDIR /app

# Copy package files

COPY package*.json ./

# Install dependencies

RUN npm install --production

# Copy application code

COPY . .

# Expose port

EXPOSE 8080

# Health check

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \

  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the bot

CMD ["npm", "start"]