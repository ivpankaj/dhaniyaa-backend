import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Project name must be at least 2 characters'),
        description: z.string().optional(),
        organizationId: z.string().min(1, 'Organization ID is required'),
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
        description: z.string().optional(),
    }),
});
