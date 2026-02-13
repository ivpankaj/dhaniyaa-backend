"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteMember = exports.getUserOrganizations = exports.createOrganization = void 0;
const organization_model_1 = require("./organization.model");
const user_model_1 = require("../user/user.model");
const createOrganization = async (userId, name) => {
    const organization = await organization_model_1.Organization.create({
        name,
        owner: userId,
        members: [{
                userId: userId,
                role: user_model_1.UserRole.ORG_OWNER,
                joinedAt: new Date()
            }]
    });
    // Update user's organization list
    await user_model_1.User.findByIdAndUpdate(userId, {
        $push: { organizations: organization._id }
    });
    return organization;
};
exports.createOrganization = createOrganization;
const getUserOrganizations = async (userId) => {
    const user = await user_model_1.User.findById(userId).populate('organizations');
    return user?.organizations || [];
};
exports.getUserOrganizations = getUserOrganizations;
const inviteMember = async (organizationId, email) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new Error('User not found');
    const organization = await organization_model_1.Organization.findById(organizationId);
    if (!organization)
        throw new Error('Organization not found');
    // Check if user is already a member
    const isMember = organization.members.some(m => m.userId.toString() === user._id.toString());
    if (isMember)
        throw new Error('User is already a member of this organization');
    // Add to organization members
    organization.members.push({
        userId: user._id,
        role: user_model_1.UserRole.VIEWER, // Default role
        joinedAt: new Date()
    });
    await organization.save();
    // Update user's organization list
    await user_model_1.User.findByIdAndUpdate(user._id, {
        $addToSet: { organizations: organization._id }
    });
    return organization;
};
exports.inviteMember = inviteMember;
