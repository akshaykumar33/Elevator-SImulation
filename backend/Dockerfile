# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Set default environment variables
ENV PORT=8000

# Document the port (for reference)
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
