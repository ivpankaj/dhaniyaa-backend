"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrgSchema = void 0;
const zod_1 = require("zod");
exports.createOrgSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
    }),
});
