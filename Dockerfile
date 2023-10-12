FROM denoland/deno:alpine-1.37.1

RUN apk --no-cache add font-noto-cjk-extra npm

WORKDIR /usr/src/app

COPY . .

RUN deno cache --node-modules-dir server.ts

RUN npm --prefix node_modules/sharp i

EXPOSE 3000

CMD [ "deno", "run", "--node-modules-dir", "--allow-read", "--allow-env", "--allow-ffi", "--allow-net", "server.ts" ]
