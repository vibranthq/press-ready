<h1 align="center">
  🚀 press-ready
  <br/>
  <img alt="screencast" src="https://github.com/vibranthq/press-ready/blob/master/.readme/screencast.gif?raw=true">
</h1>

> あなたの PDF をプレス可能な PDF/X-1a に変換しよう

[![Build Status](https://travis-ci.com/vibranthq/press-ready.svg?branch=master)](https://travis-ci.com/vibranthq/press-ready)

## 必要なもの

- Docker

## 使い方

`vibranthq/press-ready` イメージを[Docker Hub](https://hub.docker.com/r/vibranthq/press-ready/)から Pull してください。

次のコマンドを実行します: `docker run -it -v $PWD:/workdir vibranthq/press-ready --input <input.pdf> --output <output.pdf>`.

```bash
docker pull vibranthq/press-ready

docker run --rm -it \
  -v $PWD:/workdir \
  vibranthq/press-ready \
  --input ./input.pdf \
  --output ./output.pdf
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

オプション`--boundary-boxes`は生成された PDF に TrimBox、CropBox、BleedBox を埋め込みます。

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
しかし、`--enforce-outline`あるいは`--no-enforce-outline`オプションを渡すことであえて挙動を制御することが可能です。

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

シェルに `press-ready` コマンドを alias することで、普通のコマンドのように使うことができます。

```bash
alias press-ready="docker run -it -v \$PWD:/workdir vibranthq/press-ready"
```

あとは普通のコマンドと同じように `press-ready` をタイプするだけです:

```bash
press-ready --help
press-ready --input <input.pdf> --output <output.pdf>
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

## 貢献

プルリクエスト大歓迎です！プルリクエストを作成する前に `make test` でテストを通過するかを確認してください。

### 開発ビルド

```bash
make build
make test
```

### 貢献者

素晴らしい貢献者の一覧です (`git shortlog -sn` によって作成)

- Yasuaki Uechi
- Kenshi Muto
