# Vibrant Core

Maker your PDFs compliant with PDF/X-1a:Japan 2001 Coated.

## Prerequisite

- Docker

## Quick Usage

Pull `vibranthq/core` docker image from [Docker Hub](https://hub.docker.com/r/vibranthq/core/).

```bash
docker pull vibranthq/core
docker run -v $PWD:/workdir vibranthq/core input.pdf [output.pdf]
```

## Development Build

### Docker Compose

```bash
docker-compose build
docker-compose run core input.pdf [output.pdf]
```

### Docker

```bash
docker build -t vibranthq/core .
docker run -it -v $PWD/workdir vibrant/core input.pdf [output.pdf]
```
