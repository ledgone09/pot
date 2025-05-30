# Use Node.js 18 Alpine
FROM node:18-alpine

# Install necessary system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps --production=false

# Copy all source code
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000

# Start the application
CMD ["npm", "start"] 