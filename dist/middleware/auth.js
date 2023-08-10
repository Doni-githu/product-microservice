"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function default_1(req, res, next) {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: 'not authorized'
        });
        return;
    }
    else {
        axios_1.default.get('https://auth-microservices.onrender.com/api/auth/auth', {
            headers: { Authorization: req.headers.authorization }
        }).then((res) => {
            req.user = res.data;
            next();
        }).catch(() => {
            res.status(400).json({
                message: 'not authorized'
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=auth.js.map