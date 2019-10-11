#!/bin/bash

set -e

# publish npm package
np

VERSION=$(git tag | sed 's/^v//')
echo "Releasing ${VERSION}"

# publish docker image
docker build -t vibranthq/press-ready:${VERSION} .
docker publish vibranthq/press-ready:${VERSION}