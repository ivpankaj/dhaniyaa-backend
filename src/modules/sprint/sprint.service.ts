import { Sprint, ISprint } from './sprint.model';
import { Ticket } from '../ticket/ticket.model';

export const createSprint = async (data: Partial<ISprint>) => {
    return await Sprint.create(data);
};

export const getSprintsByProject = async (projectId: string) => {
    return await Sprint.find({ projectId }).sort({ startDate: 1 });
};

export const updateSprint = async (sprintId: string, updates: Partial<ISprint>) => {
    return await Sprint.findByIdAndUpdate(sprintId, updates, { new: true });
};

export const completeSprint = async (sprintId: string) => {
    // Get ticket counts for summary
    const totalTickets = await Ticket.countDocuments({ sprintId });
    const completedTickets = await Ticket.countDocuments({ sprintId, status: 'Done' });
    const pushedBackTickets = totalTickets - completedTickets;

    const sprint = await Sprint.findByIdAndUpdate(sprintId, {
        status: 'COMPLETED',
        summary: {
            totalTickets,
            completedTickets,
            pushedBackTickets
        }
    }, { new: true });

    if (!sprint) throw new Error('Sprint not found');

    // Move incomplete tickets back to backlog
    await Ticket.updateMany(
        { sprintId, status: { $ne: 'Done' } },
        { sprintId: null }
    );

    return sprint;
};
