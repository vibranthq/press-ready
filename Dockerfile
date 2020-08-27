FROM node:14-alpine as base

LABEL maintainer="Yasuaki Uechi"
LABEL license="Apache-2.0"

RUN apk add ghostscript poppler-utils

WORKDIR /app
COPY assets/* /app/assets/
COPY package.json /app/

# build press-ready
FROM base as build
RUN npm install
COPY tsconfig.json .
COPY src/ src/
RUN NODE_ENV=production npm run build

# runtime
FROM base as runtime
COPY --from=build /app/lib/ lib/
RUN npm install --production

WORKDIR /workdir
ENTRYPOINT [ "/app/lib/cli.js" ]