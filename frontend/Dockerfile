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

# Set default port
ENV PORT=7000

# Expose frontend port
EXPOSE 7000

# Start Next.js on the right port
CMD ["npm", "run", "start", "--", "-p", "7000"]
