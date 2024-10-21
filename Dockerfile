# Use Node.js 22as a base image
FROM node:22

# Set the working directory
WORKDIR /app

# Copy the rest of your Strapi project
COPY . .

# Install dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install firefox
RUN npx playwright install-deps firefox

# Build your admin panel
RUN npm run build

# Expose the Strapi port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "start"]