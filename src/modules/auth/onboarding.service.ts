import { createOrganization } from '../organization/organization.service';
import { createProject } from '../project/project.service';

export const setupNewUserWorkspace = async (userId: string, userName: string) => {
    try {
        // 1. Create Default Organization
        const orgName = `${userName}'s Workspace`;
        const organization = await createOrganization(userId, orgName);

        // 2. Create Default Project
        // The createProject service will automatically create the first Cycle (Sprint)
        const projectName = 'My First Project';
        await createProject(userId, {
            name: projectName,
            description: 'This is your first project created automatically to help you get started.',
            organizationId: organization._id.toString(),
            type: 'Software'
        });

        console.log(`Onboarding completed for user ${userId}: Created org and project.`);
    } catch (error) {
        console.error('Failed to setup workspace for new user:', error);
    }
};
