# get the base node image
FROM node:14-alpine

# set the working dir for container
WORKDIR /server

# copy the json file first
COPY package.json .
COPY package-lock.json .

# install npm dependencies
RUN npm install

# copy other project files
COPY . .

# Expose port 5000
EXPOSE 5000

# build the folder
CMD ["npm", "start"]