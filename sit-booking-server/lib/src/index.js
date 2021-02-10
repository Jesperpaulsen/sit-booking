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
var puppeteer_1 = require("./puppeteer");
var firebase_1 = require("./firebase");
var moment_1 = __importDefault(require("moment"));
var failedBookings = [];
var fetchProfiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, profilesSnapshot, _i, _a, profile;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                res = [];
                return [4 /*yield*/, firebase_1.firestore.collection('profiles').get()];
            case 1:
                profilesSnapshot = _b.sent();
                for (_i = 0, _a = profilesSnapshot.docs; _i < _a.length; _i++) {
                    profile = _a[_i];
                    res.push(profile.data());
                }
                return [2 /*return*/, res];
        }
    });
}); };
var timeToNumberMap = {
    '07:00': 1,
    '08:00': 3,
    '09:00': 5,
    '10:00': 7,
    '11:00': 9,
    '12:00': 11,
    '13:00': 13,
    '14:00': 15,
    '15:00': 17,
    '16:00': 19,
    '17:00': 21,
    '18:00': 23,
    '19:00': 25,
    '20:00': 27,
    '21:00': 29,
    '22:00': 31,
};
var convertTimeToRowNumber = function (weekDay, time) {
    var timeNumber = timeToNumberMap[time];
    if (weekDay > 4) {
        return timeNumber - 5;
    }
    return timeNumber;
};
var getCurrentRowNumber = function (weekDay) {
    var time = moment_1.default().startOf('hour').format('h');
    return timeToNumberMap[time + ":00"];
};
var bookingsThatShouldBeBooked = function (profiles) {
    var twoDaysInTheFuture = moment_1.default().add(2, 'days').weekday() - 1;
    var bookings = [];
    for (var _i = 0, profiles_1 = profiles; _i < profiles_1.length; _i++) {
        var profile = profiles_1[_i];
        var preference = profile.preferences[twoDaysInTheFuture];
        if (preference && preference.length > 0) {
            var rowNumber = convertTimeToRowNumber(twoDaysInTheFuture, preference);
            var currentRowNumber = getCurrentRowNumber(twoDaysInTheFuture);
            console.log(rowNumber);
            console.log(currentRowNumber);
            if (rowNumber === currentRowNumber) {
                var booking = {
                    day: twoDaysInTheFuture,
                    rowNumber: rowNumber,
                    profile: profile,
                };
                bookings.push(booking);
            }
        }
    }
    return bookings;
};
var bookBooking = function (booking) { return __awaiter(void 0, void 0, void 0, function () {
    var success, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, puppeteer_1.bookWithPuppeteer(booking)];
            case 1:
                success = _a.sent();
                if (!success)
                    throw new Error('Failed to book');
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                failedBookings.push(booking);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var profiles, bookings, promises, _i, bookings_1, booking, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchProfiles()];
            case 1:
                profiles = _a.sent();
                bookings = bookingsThatShouldBeBooked(profiles);
                promises = [];
                for (_i = 0, bookings_1 = bookings; _i < bookings_1.length; _i++) {
                    booking = bookings_1[_i];
                    promises.push(bookBooking(booking));
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, Promise.all(promises)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_2 = _a.sent();
                console.log(e_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
main();
