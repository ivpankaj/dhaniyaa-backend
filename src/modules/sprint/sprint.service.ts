import { Sprint, ISprint } from './sprint.model';
import { Ticket } from '../ticket/ticket.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';
import { createNotification } from '../notification/notification.service';
import { sendSprintNotificationEmail } from '../../utils/email.service';

export const createSprint = async (userId: string, data: Partial<ISprint>) => {
    const sprint = await Sprint.create({ ...data, createdBy: userId });

    // Notify Project Members in Background
    (async () => {
        try {
            const project = await Project.findById(data.projectId).populate('members.userId');
            const currentUser = await User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';

            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId as any;
                    if (!memberUser) continue;

                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await createNotification({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_created',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `created a new sprint "${sprint.name}" in project ${project.name}`
                        });

                        if (memberUser.email) {
                            await sendSprintNotificationEmail(memberUser.email, memberUser.name, sprint.name, 'created', actionBy);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to notify project members for sprint creation', e);
        }
    })();

    return sprint;
};

export const getSprintsByProject = async (projectId: string) => {
    return await Sprint.find({ projectId })
        .populate('createdBy', 'name email avatar')
        .sort({ startDate: 1 });
};

export const deleteSprint = async (sprintId: string, userId: string) => {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return null;

    // Verify auth
    if (sprint.createdBy.toString() !== userId) {
        throw new Error('Unauthorized: Only the creator can delete this sprint');
    }

    // Notify in background
    (async () => {
        try {
            const project = await Project.findById(sprint.projectId).populate('members.userId');
            const currentUser = await User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';

            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId as any;
                    if (!memberUser) continue;

                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await createNotification({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_deleted',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `deleted sprint "${sprint.name}"`
                        });
                        if (memberUser.email) {
                            await sendSprintNotificationEmail(memberUser.email, memberUser.name, sprint.name, 'deleted', actionBy);
                        }
                    }
                }
            }
        } catch (e) { console.error('Failed to notify for sprint deletion', e); }
    })();

    // Move all tickets in this sprint to backlog
    await Ticket.updateMany({ sprintId }, { sprintId: null });

    return await Sprint.findByIdAndDelete(sprintId);
};

export const updateSprint = async (sprintId: string, updates: Partial<ISprint>) => {
    return await Sprint.findByIdAndUpdate(sprintId, updates, { new: true });
};

export const completeSprint = async (sprintId: string, userId: string) => {
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

    // Notify in background
    (async () => {
        try {
            const project = await Project.findById(sprint.projectId).populate('members.userId');
            const currentUser = await User.findById(userId);
            const actionBy = currentUser?.name || 'Unknown';

            if (project) {
                for (const member of project.members) {
                    const memberUser = member.userId as any;
                    if (!memberUser) continue;

                    const memberId = memberUser._id?.toString() || memberUser.toString();
                    if (memberId !== userId) {
                        await createNotification({
                            recipient: memberId,
                            sender: userId,
                            type: 'sprint_completed',
                            entityType: 'Sprint',
                            entityId: sprint._id,
                            message: `completed sprint "${sprint.name}"`
                        });
                        if (memberUser.email) {
                            await sendSprintNotificationEmail(memberUser.email, memberUser.name, sprint.name, 'completed', actionBy);
                        }
                    }
                }
            }
        } catch (e) { console.error('Failed to notify for sprint completion', e); }
    })();

    return sprint;
};
