"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookWithPuppeteer = void 0;
var puppeteer_1 = __importDefault(require("puppeteer"));
var bookWithPuppeteer = function (booking) { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, logInBtn, cell;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                    headless: true,
                })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                page.setDefaultTimeout(6000);
                return [4 /*yield*/, page.goto('http://ibooking.sit.no/')];
            case 3:
                _a.sent();
                return [4 /*yield*/, page.$x("//a[contains(text(),'Logg inn')]")];
            case 4:
                logInBtn = _a.sent();
                return [4 /*yield*/, logInBtn[0].click()];
            case 5:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('input[name=username]')];
            case 6:
                _a.sent();
                return [4 /*yield*/, page.type('input[name=username]', booking.profile.phone.toString())];
            case 7:
                _a.sent();
                return [4 /*yield*/, page.type('input[name=password]', booking.profile.sitPassword)];
            case 8:
                _a.sent();
                return [4 /*yield*/, page.click('.btn-primary')];
            case 9:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('select[name=type]')];
            case 10:
                _a.sent();
                return [4 /*yield*/, page.select('select[name=type]', '13')];
            case 11:
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 12:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('select[name=type]')];
            case 13:
                _a.sent();
                if (!(booking.day < 2)) return [3 /*break*/, 15];
                return [4 /*yield*/, page.select('select[name=week]', '+1 weeks')];
            case 14:
                _a.sent();
                _a.label = 15;
            case 15: return [4 /*yield*/, page.waitForTimeout(1000)];
            case 16:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('select[name=type]')];
            case 17:
                _a.sent();
                return [4 /*yield*/, page.$x("//div[@id='schedule']/ul[" + (booking.day + 1) + "]/li[" + booking.rowNumber + "]/div")];
            case 18:
                cell = _a.sent();
                return [4 /*yield*/, cell[0].click()];
            case 19:
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(250)];
            case 20:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('.ui-button-text')];
            case 21:
                _a.sent();
                return [4 /*yield*/, page.click('.ui-button-text')];
            case 22:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('input[name=submit]')];
            case 23:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('.order', { timeout: 500 })];
            case 24:
                if (!((_a.sent()) !== null)) return [3 /*break*/, 27];
                return [4 /*yield*/, page.click('input[name=submit]')];
            case 25:
                _a.sent();
                return [4 /*yield*/, browser.close()];
            case 26:
                _a.sent();
                return [2 /*return*/, true];
            case 27: return [4 /*yield*/, browser.close()];
            case 28:
                _a.sent();
                return [2 /*return*/, false];
        }
    });
}); };
exports.bookWithPuppeteer = bookWithPuppeteer;
