# Use an official Node.js runtime as a parent image
FROM node:20.11.0-alpine3.22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port (ensure this matches your application port)
EXPOSE 8000

# Set environment variables (optional, if you need specific ones in production)
ENV DATABASE_URL="postgresql://postgres:youpassword@localhost:5432/postgres?schema=air_quality"
ENV JWT_SECRET="your_secret_key"
ENV PORT=8000

# Run the application
CMD ["npm", "run", "start:prod"]
