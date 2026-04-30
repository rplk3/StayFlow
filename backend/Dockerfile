FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server in Dev mode (Nodemon)
CMD ["npm", "run", "dev"]
