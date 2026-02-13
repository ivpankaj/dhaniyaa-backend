import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../user/user.model';

export interface IMember {
    userId: mongoose.Types.ObjectId;
    role: UserRole;
    joinedAt: Date;
}

export interface IOrganization extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    members: IMember[];
}

const MemberSchema = new Schema<IMember>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.VIEWER },
    joinedAt: { type: Date, default: Date.now }
});

const OrganizationSchema = new Schema<IOrganization>({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [MemberSchema]
}, {
    timestamps: true
});

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
