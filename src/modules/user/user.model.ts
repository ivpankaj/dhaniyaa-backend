import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
    SUPER_ADMIN = 'SuperAdmin',
    ORG_OWNER = 'OrganizationOwner',
    PROJECT_ADMIN = 'ProjectAdmin',
    DEVELOPER = 'Developer',
    TESTER = 'Tester',
    VIEWER = 'Viewer'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar?: string;
    isVerified: boolean;
    globalRole: string;
    organizations: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    globalRole: { type: String, default: 'user' },
    organizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
