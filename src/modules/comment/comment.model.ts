import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    ticketId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    message: string;
    attachments: string[];
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachments: [{ type: String, default: [] }]
}, {
    timestamps: true
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
