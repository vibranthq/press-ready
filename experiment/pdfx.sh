#!/bin/bash

set -e

echo Export a webpage as PDF
ts-node export-pdf.ts

# echo Remove PDF annotations
# pdftops -level3 output-webkit.pdf postscript.ps
# pstopdf postscript.ps -o mod.pdf

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
pdffonts cmyk.pdf