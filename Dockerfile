FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk --no-cache add font-noto-cjk-extra

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]
