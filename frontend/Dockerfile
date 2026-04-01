FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start Vite server. Using --host ensures it binds to 0.0.0.0
# so it can be accessed from outside the Docker container.
CMD ["npm", "run", "dev", "--", "--host"]
