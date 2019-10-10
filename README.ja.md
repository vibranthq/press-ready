<h1 align="center">
  🚀 press-ready
  <br/>
  <img alt="screencast" src="https://github.com/vibranthq/press-ready/blob/master/.github/screencast.gif?raw=true">
</h1>

> あなたの PDF をプレス可能な PDF/X-1a に変換しよう。

[🇬🇧English](README.md)

[![Build Status](https://travis-ci.com/vibranthq/press-ready.svg?branch=master)](https://travis-ci.com/vibranthq/press-ready)

## 必要なもの

- Docker

## 使い方

`vibranthq/press-ready` イメージを[Docker Hub](https://hub.docker.com/r/vibranthq/press-ready/)から Pull してください。

そして次のコマンドで`input.pdf`を変換して`output.pdf`に書き出します:

```
docker run -it -v $PWD:/workdir vibranthq/press-ready --input <input.pdf> --output <output.pdf>
```

`--input`と`--output`に指定できるのは、現在のフォルダあるいはそのサブフォルダ内のファイルのみです。なぜなら、`-v`によって現在のフォルダが Docker 内の`/workdir`にマウントされており、press-ready は`/workdir`を基準ディレクトリとして動作するからです。

```bash
docker pull vibranthq/press-ready

docker run --rm -it \
  -v $PWD:/workdir \
  vibranthq/press-ready \
  --input ./dist/input.pdf \
  --output ./dist/output.pdf
```

`docker run --rm vibranthq/press-ready --help`を実行してヘルプを表示します。

```bash
➜ docker run --rm vibranthq/press-ready --help
Options:
  --version          Show version number                               [boolean]
  --input            Input file path                                  [required]
  --output           Output file path                  [default: "./output.pdf"]
  --gray-scale       Use gray scale color space instead of CMYK
                                                      [boolean] [default: false]
  --enforce-outline  Convert embedded fonts to outlined fonts          [boolean]
  --boundary-boxes   Add boundary boxes on every page [boolean] [default: false]
  --help             Show help                                         [boolean]
```

## オプション

### カラーモード

press-ready はデフォルトで**CMYK**を使用します。代わりに**グレースケール**を使用したい場合は `--gray-scale` を渡してください。

```bash
docker run --rm -it \
  -v ${CURDIR}:/workdir \
  vibranthq/press-ready \
  --input ./input.pdf \
  --output ./output.pdf \
  --gray-scale
```

### デジタルトンボ

オプション`--boundary-boxes`を指定すると、生成された PDF に TrimBox、CropBox、BleedBox が埋め込まれます。

```bash
docker run --rm -it \
  -v ${CURDIR}:/workdir \
  vibranthq/press-ready \
  --input ./input.pdf \
  --output ./output.pdf \
  --boundary-boxes
```

### フォントのアウトライン化

press-ready はフォントのアウトライン化が必要かどうかを自動的に判断するので、このオプションを明示的に指定する必要はありません。
しかし、`--enforce-outline`あるいは`--no-enforce-outline`オプションを渡すことであえて挙動を制御することができます。

```bash
docker run --rm -it \
  -v ${CURDIR}:/workdir \
  vibranthq/press-ready \
  --input ./input.pdf \
  --output ./output.pdf \
  --enforce-outline
```

### カラープロファイル

現在、**Japan 2001 Coated**のみをサポートしています。もし他のカラープロファイルについて提案がある場合は Issue を立てることを検討してください。

## Tips

### `press-ready` コマンド

shell コンフィグに `press-ready` コマンドを alias することで、長いコマンドをタイプせずに済みます。

```bash
alias press-ready="docker run -it -v \$PWD:/workdir vibranthq/press-ready"
```

あとは普通のコマンドと同じように `press-ready` とタイプするだけです:

```bash
press-ready --help
press-ready --input <input.pdf> --output <output.pdf>
```

### PDF の検査

```bash
docker run --rm -it \
  -v ${CURDIR}:/workdir \
  vibranthq/press-ready lint --input ./input.pdf
```

`press-ready lint` コマンドによって PDF のメタデータのチェックをすることが出来ます。

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

### AWS S3 のリソースを使用する

> ! この機能は press-ready v2 ではまだ実装されていません。
> もし必要であれば、press-ready v1 (`vibranthq/pdfx`)イメージを代わりに使用してください。

Just run with S3 URL: `docker run -t vibranthq/press-ready <input s3url> <output s3url>`.

For fetching and uploading AWS S3 resources, you need to set env var `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

```bash
docker run --rm -it \
  -e AWS_ACCESS_KEY_ID=<aws_key_id> \
  -e AWS_SECRET_ACCESS_KEY=<aws_secret> \
  vibranthq/pdfx s3://bucket/input.pdf s3://bucket/output.pdf
```

## リアルワールド

press-ready を組み込んでいるプロジェクトを教えてください！

- [Re:VIEW の公式 FAQ](https://review-knowledge-ja.readthedocs.io/ja/latest/faq/faq-tex.html#1884868db054ed23b6b02a3d2a4b3c9b)で、PDF を印刷可能なフォーマットに変換する方法の一つとして press-ready が紹介されています。

## Advanced Usage

### Heroku

Heroku で `press-ready` を動かす際は、必ず [heroku-buildpack-xpdf](https://github.com/matt-note/heroku-xpdf-buildpack) を導入して`pdffonts`を使用可能な状態にしてください。

## 貢献

プルリクエスト大歓迎です！プルリクエストを作成する前に `make test` でテストを通過するかを確認してください。

### 開発ビルド

```bash
make build
make test
```

### 貢献者

素晴らしい貢献者の一覧です！ (`git shortlog -sn` によって作成)

- Yasuaki Uechi
- Kenshi Muto
