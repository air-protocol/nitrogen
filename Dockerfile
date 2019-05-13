FROM node:10.15.3-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/

RUN npm install --unsafe-perm

COPY src src
