FROM node:14-alpine as base

LABEL maintainer="Yasuaki Uechi"
LABEL license="Apache-2.0"

RUN apk add ghostscript poppler-utils

WORKDIR /app
COPY assets/* /app/assets/
COPY package.json yarn.lock /app/

# build press-ready
FROM base as build
RUN yarn install --frozen-lockfile
COPY tsconfig.json .
COPY src/ src/
RUN yarn build

# runtime
FROM base as runtime
COPY --from=build /app/lib/ lib/
RUN yarn install --frozen-lockfile --production

WORKDIR /workdir
ENTRYPOINT [ "/app/lib/cli.js" ]