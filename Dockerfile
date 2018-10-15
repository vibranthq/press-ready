FROM ubuntu:18.04
LABEL Name=core Version=0.1.0

RUN apt-get update && apt-get install -y build-essential curl

# NodeJS 10.x
# RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
# RUN apt-get update && apt-get install -y nodejs

# wkhtmltopdf 0.12.5
# RUN apt-get update && apt-get install -y gdebi
# RUN curl -sL https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.bionic_amd64.deb -o wkhtmltox.deb
# RUN gdebi --n wkhtmltox.deb && rm wkhtmltox.deb

# Xpdf / Ghostscript / ImageMagick
RUN apt-get update && apt-get install -y xpdf ghostscript imagemagick

# Chrome / Puppeteer
# RUN apt-get update && apt-get install -y libasound2-dev libxss-dev

# AWS
RUN apt-get update && apt-get install -y python3-pip && pip3 install awscli

WORKDIR /usr/src/app
COPY . .

WORKDIR /workdir
ENV PATH "/usr/src/app:$PATH"
