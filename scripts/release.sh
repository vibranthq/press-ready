#!/bin/bash

set -e

# publish npm package
np --no-yarn

VERSION=$(git describe --tags | sed 's/^v//')
echo "Releasing ${VERSION}"

# publish docker image
docker build -t vibranthq/press-ready:${VERSION} .
docker push vibranthq/press-ready
docker push vibranthq/press-ready:${VERSION}