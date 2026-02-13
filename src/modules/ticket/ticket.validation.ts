import { z } from 'zod';
import { TicketType, TicketPriority, TicketStatus } from './ticket.model';

export const createTicketSchema = z.object({
    body: z.object({
        title: z.string().min(2, 'Title must be at least 2 characters'),
        description: z.string().optional(),
        type: z.nativeEnum(TicketType).optional(),
        priority: z.nativeEnum(TicketPriority).optional(),
        status: z.nativeEnum(TicketStatus).optional(),
        projectId: z.string().min(1, 'Project ID is required'),
        assignee: z.string().optional(),
        sprintId: z.string().optional(),
        dueDate: z.string().datetime().optional(),
    }),
});

export const updateTicketSchema = z.object({
    body: z.object({
        title: z.string().min(2).optional(),
        description: z.string().optional(),
        type: z.nativeEnum(TicketType).optional(),
        priority: z.nativeEnum(TicketPriority).optional(),
        status: z.nativeEnum(TicketStatus).optional(),
        assignee: z.string().optional(),
        sprintId: z.string().optional(),
        dueDate: z.string().datetime().optional(),
    }),
});

export const updateTicketStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(TicketStatus),
    })
})
