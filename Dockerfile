FROM ubuntu:18.04

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

# press-ready
WORKDIR /app
COPY assets/* /app/assets/
COPY package.json yarn.lock /app/
RUN yarn install --only=production
COPY src/* /app/src/

WORKDIR /workdir
ENTRYPOINT [ "/app/src/cli.js" ]