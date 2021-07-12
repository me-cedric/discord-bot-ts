FROM node:14

RUN mkdir /usr/src/cache
WORKDIR /usr/src/cache

COPY package*.json ./
RUN npm install

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY /usr/src/cache/node_modules/. /usr/src/app/node_modules/

EXPOSE 8080
CMD [ "npm", "start" ]