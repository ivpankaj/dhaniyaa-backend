"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Project name must be at least 2 characters'),
        description: zod_1.z.string().optional(),
        organizationId: zod_1.z.string().min(1, 'Organization ID is required'),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Project name must be at least 2 characters').optional(),
        description: zod_1.z.string().optional(),
    }),
});
