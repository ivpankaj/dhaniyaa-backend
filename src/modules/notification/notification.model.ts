import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    type: 'ASSIGNED' | 'COMMENT' | 'STATUS_CHANGE' | 'MENTION' | 'ticket_assigned' | 'comment_added' | 'ticket_status_change' | 'ticket_deleted' | 'sprint_created' | 'sprint_deleted' | 'sprint_completed';
    entityType: 'Ticket' | 'Project' | 'Sprint';
    entityId: mongoose.Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['ASSIGNED', 'COMMENT', 'STATUS_CHANGE', 'MENTION', 'ticket_assigned', 'comment_added', 'ticket_status_change', 'ticket_deleted', 'sprint_created', 'sprint_deleted', 'sprint_completed'], required: true },
    entityType: { type: String, enum: ['Ticket', 'Project', 'Sprint'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
