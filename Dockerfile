FROM ubuntu:18.04

RUN apt-get update -qq && apt-get install -yqq curl

# Xpdf, Ghostscript, ImageMagick
RUN apt-get update -qq && apt-get install -yqq xpdf ghostscript imagemagick

# NodeJS
RUN apt-get update -qq && apt-get install -yqq nodejs npm && npm install n -g && n 11.13.0
RUN npm install -g yarn

# AWS
RUN apt-get update -qq && apt-get install -yqq python3-pip && pip3 install awscli

# press-ready
WORKDIR /app
COPY assets/* /app/assets/
COPY package.json yarn.lock /app/
RUN yarn install --only=production
COPY src/* /app/src/

WORKDIR /workdir
ENTRYPOINT [ "/app/src/cli.js" ]