#!/bin/bash

set -e

echo "VERSION: ${VERSION}"

# publish docker image
docker tag vibranthq/press-ready vibranthq/press-ready:${VERSION} 
docker tag vibranthq/press-ready docker.pkg.github.com/vibranthq/press-ready/press-ready:latest

docker push vibranthq/press-ready:latest
docker push vibranthq/press-ready:${VERSION}
docker push docker.pkg.github.com/vibranthq/press-ready/press-ready:latest