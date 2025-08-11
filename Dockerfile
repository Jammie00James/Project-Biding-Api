# Use a lightweight Node.js image
FROM node:23.11.0-slim

# Set working directory inside container
WORKDIR /usr/src/app

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install global dev dependencies
RUN npm install -g nodemon

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

#Install proc, for debugging
RUN apt update && apt install -y procps


# Copy the rest of your application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN npx prisma migrate dev

# Expose the dev port
EXPOSE 3000

# Run the app with nodemon or your dev script
CMD ["npm", "run", "start:dev"]
