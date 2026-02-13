"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        ticketId: zod_1.z.string().min(1, 'Ticket ID is required'),
        message: zod_1.z.string().min(1, 'Message cannot be empty'),
    }),
});
