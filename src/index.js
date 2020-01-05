const {pdfFonts, pdfInfo, isXPDFAvailable} = require('./xpdf');
const {ghostScript, isGhostscriptAvailable} = require('./ghostScript');

module.exports = {
  ghostScript,
  isGhostscriptAvailable,
  pdfFonts,
  pdfInfo,
  isXPDFAvailable,
};
