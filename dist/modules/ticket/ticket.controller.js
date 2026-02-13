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
exports.getBySprint = exports.updateStatus = exports.update = exports.getByProject = exports.create = void 0;
const ticketService = __importStar(require("./ticket.service"));
const activityService = __importStar(require("../activity/activity.service"));
const create = async (req, res, next) => {
    try {
        if (req.body.assignee && String(req.body.assignee) === String(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You cannot assign a task to yourself' });
        }
        const ticket = await ticketService.createTicket(req.user._id.toString(), req.body);
        // Emit socket event
        const io = req.app.get('io');
        io.to(req.body.projectId).emit('ticket_created', ticket);
        res.status(201).json({ success: true, data: ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getByProject = async (req, res, next) => {
    try {
        const projectId = req.query.projectId;
        const sprintId = req.query.sprintId;
        // Ensure projectId is a string
        if (typeof projectId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid projectId' });
            return;
        }
        const tickets = await ticketService.getTicketsByProject(projectId, sprintId);
        res.status(200).json({ success: true, data: tickets });
    }
    catch (error) {
        next(error);
    }
};
exports.getByProject = getByProject;
const update = async (req, res, next) => {
    try {
        if (req.body.assignee && String(req.body.assignee) === String(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You cannot assign a task to yourself' });
        }
        const ticket = await ticketService.updateTicket(req.params.id, req.body);
        // Emit socket event
        if (ticket) {
            const io = req.app.get('io');
            io.to(ticket.projectId.toString()).emit('ticket_updated', ticket);
        }
        res.status(200).json({ success: true, data: ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const ticket = await ticketService.updateTicketStatus(req.params.id, status);
        if (ticket) {
            const io = req.app.get('io');
            io.to(ticket.projectId.toString()).emit('ticket_updated', ticket);
            // Log Activity
            await activityService.createActivity({
                entityType: 'Ticket',
                entityId: ticket._id,
                userId: req.user._id,
                action: 'moved',
                details: `changed status to ${status}`
            });
        }
        res.status(200).json({ success: true, data: ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const getBySprint = async (req, res, next) => {
    try {
        const tickets = await ticketService.getTicketsBySprint(req.params.sprintId);
        res.status(200).json({ success: true, data: tickets });
    }
    catch (error) {
        next(error);
    }
};
exports.getBySprint = getBySprint;
