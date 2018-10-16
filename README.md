# Vibrant Core

Make your PDFs compliant with PDF/X-1a.

## Prerequisite

- Docker

## Quick Usage

Pull `vibranthq/core` image from [Docker Hub](https://hub.docker.com/r/vibranthq/core/).

```bash
docker pull vibranthq/core
docker run -v $PWD:/workdir vibranthq/core core ./input.pdf [./output.pdf]
docker run vibranthq/core core s3://bucket/file.pdf [s3://bucket/output.pdf]
```

for fetching and uploading AWS S3 resources, you need to set env var for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

## Development Build

### Docker

```bash
docker build -t vibranthq/core .
docker run -it -v $PWD/workdir vibrant/core core ./input.pdf [./output.pdf]
docker run -it vibrant/core core s3://bucket/file.pdf [s3://bucket/output.pdf]
```

### Docker Compose

```bash
docker-compose build
docker-compose run core core input.pdf [output.pdf]
```

## Configuration

### Color Profile

There is a support only for **Japan 2001 Coated**. If you have any suggestions, please consider submitting an issue.

### Color Mode

Currently supports **CMYK** and planned to support **Grayscale** color mode.
