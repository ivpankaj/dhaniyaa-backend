import { Organization } from './organization.model';
import { User, UserRole } from '../user/user.model';

export const createOrganization = async (userId: string, name: string) => {
    const organization = await Organization.create({
        name,
        owner: userId,
        members: [{
            userId: userId,
            role: UserRole.ORG_OWNER,
            joinedAt: new Date()
        }]
    });

    // Update user's organization list
    await User.findByIdAndUpdate(userId, {
        $push: { organizations: organization._id }
    });

    return organization;
};

export const getUserOrganizations = async (userId: string) => {
    const user = await User.findById(userId).populate('organizations').lean();
    return (user as any)?.organizations || [];
};

export const inviteMember = async (organizationId: string, email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const organization = await Organization.findById(organizationId);
    if (!organization) throw new Error('Organization not found');

    // Check if user is already a member
    const isMember = organization.members.some(m => m.userId.toString() === user._id.toString());
    if (isMember) throw new Error('User is already a member of this organization');

    // Add to organization members
    organization.members.push({
        userId: user._id as any,
        role: UserRole.VIEWER, // Default role
        joinedAt: new Date()
    });
    await organization.save();

    // Update user's organization list
    await User.findByIdAndUpdate(user._id, {
        $addToSet: { organizations: organization._id }
    });

    return organization;
};

export const deleteOrganization = async (organizationId: string, userId: string) => {
    const organization = await Organization.findById(organizationId);
    if (!organization) return null;

    if (organization.owner.toString() !== userId) {
        throw new Error('Unauthorized: Only the organization owner can delete this organization');
    }

    return await Organization.findByIdAndDelete(organizationId);
};
