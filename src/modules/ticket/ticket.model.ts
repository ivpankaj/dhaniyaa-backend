import mongoose, { Document, Schema } from 'mongoose';

export enum TicketType {
    BUG = 'Bug',
    TASK = 'Task',
    STORY = 'Story',
    EPIC = 'Epic'
}

export enum TicketPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical'
}

export enum TicketStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    IN_REVIEW = 'In Review',
    DONE = 'Done'
}

export interface ITicket extends Document {
    title: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    type: TicketType;
    priority: TicketPriority;
    status: TicketStatus;
    assignee?: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
    comments: mongoose.Types.ObjectId[]; // Ref to separate Comment model
    dueDate?: Date;
    sprintId?: mongoose.Types.ObjectId;
    sprintHistory: mongoose.Types.ObjectId[];
    attachments: string[];
    watchers: mongoose.Types.ObjectId[];
}

const TicketSchema = new Schema<ITicket>({
    title: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: Object.values(TicketType), default: TicketType.TASK },
    priority: { type: String, enum: Object.values(TicketPriority), default: TicketPriority.MEDIUM },
    status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.TODO },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    dueDate: { type: Date },
    sprintId: { type: Schema.Types.ObjectId, ref: 'Sprint' },
    sprintHistory: [{ type: Schema.Types.ObjectId, ref: 'Sprint', default: [] }],
    attachments: [{ type: String, default: [] }],
    watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

// Text index for search
TicketSchema.index({ title: 'text', description: 'text' });

// Compound indices for common query patterns
TicketSchema.index({ projectId: 1, sprintId: 1 });
TicketSchema.index({ projectId: 1, status: 1 });
TicketSchema.index({ organizationId: 1, status: 1 });
TicketSchema.index({ assignee: 1, status: 1 });

TicketSchema.index({ sprintId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ assignee: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ reporter: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
