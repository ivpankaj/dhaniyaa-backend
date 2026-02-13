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
    sprints: [{ type: Schema.Types.ObjectId, ref: 'Sprint' }]
}, {
    timestamps: true
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
