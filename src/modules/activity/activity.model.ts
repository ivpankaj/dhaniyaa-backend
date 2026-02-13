import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    entityType: 'Ticket' | 'Project' | 'Sprint';
    entityId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string; // e.g., 'created', 'moved', 'commented'
    details?: string; // e.g., 'moved from To Do to Done'
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    entityType: { type: String, enum: ['Ticket', 'Project', 'Sprint'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
