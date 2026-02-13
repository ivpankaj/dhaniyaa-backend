import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
    email: string;
    projectId: mongoose.Types.ObjectId;
    invitedBy: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    token?: string; // Optional: for email verification links
    createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
    email: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    token: { type: String }
}, {
    timestamps: true
});

// Ensure an email can only have one pending invite per project
InvitationSchema.index({ email: 1, projectId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
