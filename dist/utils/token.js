"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Token {
    static encode(token) {
        const result = jsonwebtoken_1.default.sign(token, "SOME");
        return result;
    }
    static decode(token) {
        return jsonwebtoken_1.default.decode(token, { complete: true });
    }
}
exports.default = Token;
//# sourceMappingURL=token.js.map