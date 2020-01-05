FROM ubuntu:18.04 as base

LABEL maintainer="Yasuaki Uechi"
LABEL license="Apache-2.0"

# Xpdf, Ghostscript
RUN apt-get update -qq && apt-get install -yqq \
  curl \
  xpdf=3.04-7 \
  ghostscript=9.26~dfsg+0-0ubuntu0.18.04.12

# NodeJS
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y nodejs yarn

WORKDIR /app
COPY assets/* /app/assets/
COPY package.json yarn.lock /app/

# build press-ready
FROM base as build
RUN yarn install
COPY tsconfig.json .
COPY src/ src/
RUN NODE_ENV=production yarn build

FROM base as runtime
COPY --from=build /app/lib/ lib/
RUN yarn install --only=production

WORKDIR /workdir
ENTRYPOINT [ "/app/lib/cli.js" ]