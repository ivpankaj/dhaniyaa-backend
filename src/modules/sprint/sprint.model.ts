import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    projectId: mongoose.Types.ObjectId;
    status: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
    summary: {
        totalTickets: number;
        completedTickets: number;
        pushedBackTickets: number;
    };
    createdBy: mongoose.Types.ObjectId;
}

const SprintSchema = new Schema<ISprint>({
    name: { type: String, required: true },
    goal: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'PLANNED', 'COMPLETED'], default: 'ACTIVE' },
    summary: {
        totalTickets: { type: Number, default: 0 },
        completedTickets: { type: Number, default: 0 },
        pushedBackTickets: { type: Number, default: 0 }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

export const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);
