import { z } from 'zod';

export const createCommentSchema = z.object({
    body: z.object({
        ticketId: z.string().min(1, 'Ticket ID is required'),
        message: z.string().min(1, 'Message cannot be empty'),
        attachments: z.array(z.string()).optional(),
    }),
});
