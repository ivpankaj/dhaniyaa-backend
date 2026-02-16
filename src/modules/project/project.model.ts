import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../user/user.model';

export interface IProjectMember {
    userId: mongoose.Types.ObjectId;
    role: UserRole;
}

export interface IProject extends Document {
    name: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    members: IProjectMember[];
    createdBy: mongoose.Types.ObjectId;
    type: string;
    sprints: mongoose.Types.ObjectId[];
}

const ProjectMemberSchema = new Schema<IProjectMember>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.VIEWER }
});

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    members: [ProjectMemberSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, default: 'Software' },
    sprints: [{ type: Schema.Types.ObjectId, ref: 'Sprint' }]
}, {
    timestamps: true
});

// Indices for fast lookups
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ organizationId: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
