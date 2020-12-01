# Lightweight Node.js v14 base image
FROM node:14-alpine

# Specify working directory
WORKDIR /app

# Copy package.json before copying contents of project
COPY package.json .

# Install dependencies from package.json
RUN npm install

# Copy project contents to image
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the app
CMD npm start
