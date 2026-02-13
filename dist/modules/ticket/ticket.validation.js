"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatusSchema = exports.updateTicketSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
const ticket_model_1 = require("./ticket.model");
exports.createTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
        description: zod_1.z.string().optional(),
        type: zod_1.z.nativeEnum(ticket_model_1.TicketType).optional(),
        priority: zod_1.z.nativeEnum(ticket_model_1.TicketPriority).optional(),
        status: zod_1.z.nativeEnum(ticket_model_1.TicketStatus).optional(),
        projectId: zod_1.z.string().min(1, 'Project ID is required'),
        assignee: zod_1.z.string().optional(),
        sprintId: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
});
exports.updateTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        type: zod_1.z.nativeEnum(ticket_model_1.TicketType).optional(),
        priority: zod_1.z.nativeEnum(ticket_model_1.TicketPriority).optional(),
        status: zod_1.z.nativeEnum(ticket_model_1.TicketStatus).optional(),
        assignee: zod_1.z.string().optional(),
        sprintId: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().datetime().optional(),
    }),
});
exports.updateTicketStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(ticket_model_1.TicketStatus),
    })
});
