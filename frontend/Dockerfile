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

# Build Next.js app
RUN npm run build

# Expose frontend port
EXPOSE 7000

# Start the frontend app
CMD ["npm", "start"]
