FROM node:20-alpine

WORKDIR /app

# Copy package files and .npmrc
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with specific Node environment setup
ENV NODE_ENV=development
ENV NODE_OPTIONS=--experimental-global-webcrypto
RUN apk add --no-cache python3 make g++ \
    && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Ensure proper permissions
RUN chmod -R 777 /app

# Expose Vite default port inside the container
EXPOSE 5173

# Start development server and bind to 0.0.0.0 on port 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
