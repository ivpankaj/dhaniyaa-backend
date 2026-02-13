"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateSignature = (paramsToSign, apiSecret) => {
    const sortedParams = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&');
    const signature = crypto_1.default
        .createHash('sha1')
        .update(sortedParams + apiSecret)
        .digest('hex');
    return signature;
};
exports.generateSignature = generateSignature;
