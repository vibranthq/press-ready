#!/bin/bash

set -e

ROOT_DIR=/usr/src/app
WORK_DIR=/workdir
INPUT_FILE=$1
OUTPUT_FILE=${2:-${WORK_DIR}/output.pdf}

if [[ -z $INPUT_FILE ]]; then
  echo "==> specify input. aborting"
  exit 0
fi
echo "==> in:  ${INPUT_FILE}"
echo "==> out: ${OUTPUT_FILE}"

# echo "=> Removing PDF annotations"
# pdf2ps -level3 $INPUT_FILE ${ROOT_DIR}/postscript.ps
# ps2pdf ${ROOT_DIR}/postscript.ps ${ROOT_DIR}/purified.pdf

echo "==> Generating PDF compliant with PDF/X-1a:2001"
PDFX_DEF_PATH=$ROOT_DIR/assets/PDFX_def.ps
ICC_PROFILE_PATH=$ROOT_DIR/assets/JapanColor2001Coated.icc
echo "==> PDFX_def.ps = ${PDFX_DEF_PATH}"
echo "==> ICC = ${ICC_PROFILE_PATH}"
gs \
  -dPDFX \
  -dBATCH \
  -dNOPAUSE \
  -dNOOUTERSAVE \
  -dPDFSTOPONERROR \
  -sDEVICE=pdfwrite \
  -dShowAnnots=false \
  -dNoOutputFonts \
  -dPDFSETTINGS=/prepress \
  -dUseCropBox \
  -dUseTrimBox \
  -dUseBleedBox \
  -dPrinted \
  -sProcessColorModel=DeviceCMYK \
  -sColorConversionStrategy=CMYK \
  -sColorConversionStrategyForImages=CMYK \
  -sOutputICCProfile=${ICC_PROFILE_PATH} \
  -sOutputFile="${OUTPUT_FILE}" ${PDFX_DEF_PATH} $INPUT_FILE

echo "==> Diagnostics for pdffonts"
pdffonts $OUTPUT_FILE
