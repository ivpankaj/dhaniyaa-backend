"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = exports.TicketStatus = exports.TicketPriority = exports.TicketType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TicketType;
(function (TicketType) {
    TicketType["BUG"] = "Bug";
    TicketType["TASK"] = "Task";
    TicketType["STORY"] = "Story";
    TicketType["EPIC"] = "Epic";
})(TicketType || (exports.TicketType = TicketType = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "Low";
    TicketPriority["MEDIUM"] = "Medium";
    TicketPriority["HIGH"] = "High";
    TicketPriority["CRITICAL"] = "Critical";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["TODO"] = "To Do";
    TicketStatus["IN_PROGRESS"] = "In Progress";
    TicketStatus["IN_REVIEW"] = "In Review";
    TicketStatus["DONE"] = "Done";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
const TicketSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: Object.values(TicketType), default: TicketType.TASK },
    priority: { type: String, enum: Object.values(TicketPriority), default: TicketPriority.MEDIUM },
    status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.TODO },
    assignee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reporter: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Comment' }],
    dueDate: { type: Date },
    sprintId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Sprint' },
    sprintHistory: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Sprint', default: [] }],
    attachments: [{ type: String, default: [] }],
    watchers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
// Text index for search
TicketSchema.index({ title: 'text', description: 'text' });
TicketSchema.index({ sprintId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ assignee: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ reporter: 1 });
exports.Ticket = mongoose_1.default.model('Ticket', TicketSchema);
