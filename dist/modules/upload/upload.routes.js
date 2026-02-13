"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const cloudinary_1 = require("../../utils/cloudinary");
const router = express_1.default.Router();
router.get('/signature', auth_middleware_1.protect, (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'dhaniyaa';
    const paramsToSign = {
        timestamp,
        folder
    };
    const signature = (0, cloudinary_1.generateSignature)(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.json({
        success: true,
        data: {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        }
    });
});
exports.default = router;
