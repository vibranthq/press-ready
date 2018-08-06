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
const markdown_it_1 = __importDefault(require("markdown-it"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const wkhtmltopdf_1 = __importDefault(require("wkhtmltopdf"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
function exportPDF(inputMarkdownSource, outputPath) {
    // Input markdown to HTML
    const md = markdown_it_1.default();
    const result = md.render(inputMarkdownSource);
    console.log(result);
    // HTML to PDF
    const workspaceDir = os_1.default.tmpdir();
    const outputPDFPath = path_1.default.join(workspaceDir, 'output.pdf');
    const exported_path = exportPDFWebkit(result, outputPDFPath);
    console.log(outputPDFPath);
}
exports.exportPDF = exportPDF;
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
function exportPDFWebkit(sourceString, outputPath) {
    wkhtmltopdf_1.default(sourceString, {
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
    }).pipe(fs_1.default.createWriteStream(outputPath));
}
