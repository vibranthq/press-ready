<h1 align="center">
  🚀 press-ready
  <br/>
  <img alt="screencast" src="https://github.com/vibranthq/press-ready/blob/master/.github/screencast.gif?raw=true">
</h1>

> Make your PDF compliant with press-ready PDF/X-1a.

![npm: version](https://badgen.net/npm/v/press-ready)
![npm: total downloads](https://badgen.net/npm/dt/press-ready)
[![Build Status](https://travis-ci.com/vibranthq/press-ready.svg?branch=master)](https://travis-ci.com/vibranthq/press-ready)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2c6709d994ab4526af91d11f9ef77193)](https://www.codacy.com/gh/vibranthq/press-ready?utm_source=github.com&utm_medium=referral&utm_content=vibranthq/press-ready&utm_campaign=Badge_Grade)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/vibranthq/press-ready.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/vibranthq/press-ready/alerts/)

[🇯🇵 日本語](README.ja.md)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Tips](#tips)
- [Advanced Usage](#advanced-usage)
- [Contribution](#contribution)

## Install

### via Docker 🐳 (Recommended)

Pull `vibranthq/press-ready` image from [Docker Hub](https://hub.docker.com/r/vibranthq/press-ready/).

```bash
docker pull vibranthq/press-ready
```

then assign an alias for `press-ready`:

```bash
alias press-ready="docker run --rm -it -v \$PWD:/workdir vibranthq/press-ready"
```

### via npm 📦

```bash
npm install -g press-ready # npm
yarn global add press-ready # yarn
```

and install system dependencies to run `press-ready`.

#### macOS

```bash
brew install poppler ghostscript
```

#### Ubuntu

```bash
apt-get install poppler-utils ghostscript
```

#### Windows

Download and install the Ghostscript for Windows at <https://www.ghostscript.com/download/gsdnld.html>.
Then, add the installed Ghostscript's bin directory (e.g., "C:\\Program Files\\gs\\gs9.52\\bin") to the PATH environment variable.

Download and install the Xpdf command line tools for Windows at <http://www.xpdfreader.com/download.html>.
Then, add the installed Xpdf's bin directory (e.g., "C:\\xpdf-tools-win-4.02\\bin64") to the PATH environment variable.

## Usage

Run `press-ready` with `-i, --input`. If `-o, --output` is missing, `output.pdf` going to be used for default output path.

```
press-ready build -i <input.pdf> -o <output.pdf>
```

Run with `--help` for the help.

```bash
❯ press-ready --help
press-ready <command>

Commands:
  press-ready build         build PDF
  press-ready lint <input>  lint PDF

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

### Options

#### Color Mode

Press-ready will use **CMYK** by default. Give `--gray-scale` option to let them use **Grayscale** instead.

```bash
pres-ready build \
  --input ./input.pdf \
  --output ./output.pdf \
  --gray-scale
```

#### Boundary Boxes

Option `--boundary-boxes` will build TrimBox, CropBox and BleedBox on a generated PDF.

```bash
press-ready build \
  --input ./input.pdf \
  --output ./output.pdf \
  --boundary-boxes
```

#### Outlined Fonts

You might not want to use this option since press-ready automatically guess whether embedded fonts should be outlined.
However, you can still control this behavior by passing `--enforce-outline` or `--no-enforce-outline`.

```bash
press-ready bulid \
  --input ./input.pdf \
  --output ./output.pdf \
  --enforce-outline
```

#### Color Profile

Currently, there is only support for **Japan 2001 Coated**. If you have any suggestions, please consider submitting an issue.

## Tips

### Lint PDF

```bash
press-ready lint ./input.pdf
```

`press-ready lint` command produces lint result on specified PDF.

```
==> Linting metadata for './cli/test/fixture/review.pdf'
==> Title Re:VIEWテンプレート
==> Page No. 8
==> PDF version 1.5
==> TrimBox 48.19,66.61,467.72,661.89
==> BleedBox 39.68,58.11,476.22,670.39
==> Listing fonts
name                                      type         embedded  subset
ORFHCM+NimbusSanL-Regu                    Type 1C      yes       yes
JCEWND+NimbusSanL-Bold                    Type 1C      yes       yes
ASNLWJ+NotoSansCJKjp-Bold-Identity-H      CID Type 0C  yes       yes
HPDDST+LMRoman9-Regular                   Type 1C      yes       yes
RJMBNU+NotoSerifCJKjp-Regular-Identity-H  CID Type 0C  yes       yes
==> Every font is properly embedded or no fonts embedded
```

### Pull resource from AWS S3

> ! This feature is not yet available in press-ready v2.
> If you need this feature, use press-ready v1 (`vibranthq/pdfx`) image instead.

Just run with S3 URL: `docker run -t vibranthq/press-ready <input s3url> <output s3url>`.

For fetching and uploading AWS S3 resources, you need to set env var `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

```bash
docker run --rm -it \
  -e AWS_ACCESS_KEY_ID=<aws_key_id> \
  -e AWS_SECRET_ACCESS_KEY=<aws_secret> \
  vibranthq/pdfx s3://bucket/input.pdf s3://bucket/output.pdf
```

## Advanced Usage

### Heroku

To run `press-ready` on Heroku, make sure you add [heroku-buildpack-xpdf](https://github.com/matt-note/heroku-xpdf-buildpack).

## Contribution

PRs are welcome. Make sure to do `make test` before filing pull requests.

### Development Build

```bash
make build
make test
```

## Blogs

- [press-ready - PDF を PDF/X-1a に変換 MOONGIFT](https://www.moongift.jp/2019/05/press-ready-pdf%E3%82%92pdfx-1a%E3%81%AB%E5%A4%89%E6%8F%9B/)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://uechi.io"><img src="https://avatars0.githubusercontent.com/u/431808?v=4" width="100px;" alt="Yasuaki Uechi"/><br /><sub><b>Yasuaki Uechi</b></sub></a><br /><a href="https://github.com/vibranthq/press-ready/commits?author=uetchy" title="Code">💻</a> <a href="https://github.com/vibranthq/press-ready/commits?author=uetchy" title="Documentation">📖</a></td>
    <td align="center"><a href="http://kmuto.jp/"><img src="https://avatars2.githubusercontent.com/u/183523?v=4" width="100px;" alt="Kenshi Muto"/><br /><sub><b>Kenshi Muto</b></sub></a><br /><a href="https://github.com/vibranthq/press-ready/commits?author=kmuto" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
