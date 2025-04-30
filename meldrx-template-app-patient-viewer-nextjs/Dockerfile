# Use a lightweight Node.js image as the base for the builder
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
# Copy them first to leverage Docker cache if dependencies haven't changed
COPY package.json package-lock.json* ./

# Install dependencies (using `npm ci` for clean install based on lock file)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# Make sure your next.config.js has output: 'standalone'
RUN npm run build

# Stage 2: Runner - Runs the built application from the standalone output
# Use a minimal base image
# Using node again for simplicity, but could be smaller
FROM node:18-alpine AS runner 

# Set the working directory inside the container
WORKDIR /app

# Copy the standalone output from the builder stage
# The standalone output includes a minimal node_modules and necessary files
COPY --from=builder /app/.next/standalone ./

# Copy static files (if any)
COPY --from=builder /app/.next/static ./.next/static

# Copy the public directory (if any)
COPY public ./public

# Set environment variable for production mode
ENV NODE_ENV production

# Expose the port the app will run on (Next.js default is 3000)
EXPOSE 3000

# Command to run the application
# In standalone mode, the entrypoint is a generated server.js file
CMD ["node", "server.js"]