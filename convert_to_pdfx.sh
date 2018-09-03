#!/bin/bash

set -e

INPUT_FILE=$1
OUTPUT_FILE=/datadir/output.pdf

if [[ -z $INPUT_FILE ]]; then
  echo specify input. aborting
  exit 0
fi
echo in: $INPUT_FILE
echo out: $OUTPUT_FILE

echo Convert HTML to PDF
./node_modules/.bin/ts-node ./converter/cli.ts "$INPUT_FILE" rendered.pdf

echo Remove PDF annotations
pdf2ps -level3 ./rendered.pdf ./postscript.ps
ps2pdf ./postscript.ps ./purified.pdf

echo Make PDF compliant with PDF/X-1a:2001
gs \
  -dPDFX \
  -dBATCH \
  -dNOPAUSE \
  -dNOOUTERSAVE \
  -dShowAnnots=false \
  -dPDFSETTINGS=/prepress \
  -dPDFSTOPONERROR \
  -dUseCropBox \
  -dUseTrimBox \
  -dUseBleedBox \
  -dPrinted \
  -sProcessColorModel=DeviceCMYK \
  -sColorConversionStrategy=CMYK \
  -sColorConversionStrategyForImages=CMYK \
  -sOutputICCProfile=assets/JapanColor2001Coated.icc \
  -sDEVICE=pdfwrite \
  -sOutputFile="$OUTPUT_FILE" $PWD/assets/PDFX_def.ps purified.pdf
identify $OUTPUT_FILE
pdffonts $OUTPUT_FILE
