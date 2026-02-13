import { Activity, IActivity } from './activity.model';

export const createActivity = async (data: Partial<IActivity>) => {
    return await Activity.create(data);
};

export const getActivitiesByEntity = async (entityId: string) => {
    return await Activity.find({ entityId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
};

export const getActivitiesByProject = async (projectId: string) => {
    // This is a bit complex without joining, usually we query activities where entityId is in the list of tickets for a project, or the project log itself.
    // For simplicity, let's just log project-level activities for now or add a projectId field to Activity.
    // Adding projectId to Activity model would be better for efficient querying.
    // But for now, let's just return project level.
    return await Activity.find({ entityId: projectId }).populate('userId', 'name').sort({ createdAt: -1 });
}
