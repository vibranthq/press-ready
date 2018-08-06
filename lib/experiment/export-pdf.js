"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const wkhtmltopdf_1 = __importDefault(require("wkhtmltopdf"));
function exportPDFChrome(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        yield page.goto(url, { waitUntil: ['networkidle0'], timeout: 10000 });
        // await page.setViewport({
        //   width: 2100,
        //   height: 2970,
        // })
        yield page.pdf({
            path: './output.pdf',
            format: 'A4',
            width: '210mm',
            height: '297mm',
            landscape: false,
        });
        yield browser.close();
    });
}
function exportPDFWebkit(url) {
    wkhtmltopdf_1.default(url, {
        output: 'output.pdf',
        pageSize: 'A4',
        imageDpi: 300,
        dpi: 300,
        title: 'PDFC',
        marginTop: 10,
        marginRight: 10,
        marginLeft: 10,
        marginBottom: 10,
        disableExternalLinks: true,
        disableJavascript: true,
        printMediaType: true,
    });
}
const targetURL = 'file:///Users/uetchy/Repos/src/github.com/uetchy/vibrant-core/experiment/book2.html';
exportPDFChrome(targetURL);
