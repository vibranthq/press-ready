FROM ubuntu:18.04 as base

LABEL maintainer="Yasuaki Uechi"
LABEL license="Apache-2.0"

# Xpdf, Ghostscript
RUN apt-get update -qq && apt-get install -yqq \
  curl \
  xpdf=3.04-7 \
  ghostscript=9.26~dfsg+0-0ubuntu0.18.04.12

# NodeJS
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update && apt-get install -y --no-install-recommends nodejs

WORKDIR /app
COPY assets/* /app/assets/
COPY package.json /app/

# build press-ready
FROM base as build
RUN npm install
COPY tsconfig.json .
COPY src/ src/
RUN NODE_ENV=production npm run build

FROM base as runtime
COPY --from=build /app/lib/ lib/
RUN npm install --production

WORKDIR /workdir
ENTRYPOINT [ "/app/lib/cli.js" ]