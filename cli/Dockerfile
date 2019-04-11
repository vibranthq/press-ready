FROM ubuntu:18.04
LABEL Name=press-ready Version=0.1.0

RUN apt-get update -qq && apt-get install -yqq curl

# Xpdf, Ghostscript, ImageMagick
RUN apt-get update -qq && apt-get install -yqq xpdf ghostscript imagemagick

# NodeJS
RUN apt-get update -qq && apt-get install -yqq nodejs npm && npm install n -g && n 11.13.0
RUN npm install -g yarn

# AWS
RUN apt-get update -qq && apt-get install -yqq python3-pip && pip3 install awscli

WORKDIR /app
COPY assets/* /app/assets/
COPY package.json yarn.lock /app/
RUN yarn install --only=production
COPY src/* /app/src/

WORKDIR /workdir
ENTRYPOINT [ "/app/src/cli.js" ]

# wkhtmltopdf 0.12.5
# RUN apt-get update && apt-get install -y gdebi
# RUN curl -sL https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.bionic_amd64.deb -o wkhtmltox.deb
# RUN gdebi --n wkhtmltox.deb && rm wkhtmltox.deb

# Chrome / Puppeteer
# RUN apt-get update && apt-get install -y libasound2-dev libxss-dev
