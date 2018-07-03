#!/bin/bash

set -e

echo Export a webpage as PDF
# ts-node chrome-pdf.ts
# identify output.pdf

echo Remove PDF annotations
pdftops -level3 output.pdf output.ps
pstopdf output.ps -o mod.pdf
identify mod.pdf

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
  -sOutputICCProfile=JapanColor2001Coated.icc \
  -sDEVICE=pdfwrite \
  -sOutputFile=cmyk.pdf $PWD/PDFX_def.ps mod.pdf
identify cmyk.pdf