"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.getMine = void 0;
const notificationService = __importStar(require("./notification.service"));
const getMine = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user._id.toString());
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        next(error);
    }
};
exports.getMine = getMine;
const markRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user._id.toString());
        res.status(200).json({ success: true, data: notification });
    }
    catch (error) {
        next(error);
    }
};
exports.markRead = markRead;
const markAllRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user._id.toString());
        res.status(200).json({ success: true, message: 'All marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllRead = markAllRead;
